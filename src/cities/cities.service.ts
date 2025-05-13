import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { PrismaService } from '../database/prisma.service';
import { WeatherService } from '../weather/services/weather.service';
import { CityWithWeatherDto } from './dto/city-with-weather.dto';
import { CityDto } from './dto/city.dto';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherService: WeatherService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly metricsService: MetricsService,
  ) {}

  async findAll(): Promise<CityDto[]> {
    const cacheKey = 'all_cities';
    const cachedCities = await this.cacheManager.get<CityDto[]>(
      cacheKey,
    );

    if (cachedCities) {
      this.metricsService.cacheInteractions.inc({ cache_name: cacheKey, status: 'hit' });
      this.logger.debug(`Cache HIT for key: ${cacheKey}`);
      return cachedCities;
    }

    this.metricsService.cacheInteractions.inc({ cache_name: cacheKey, status: 'miss' });
    this.logger.debug(`Cache MISS for key: ${cacheKey}`);
    const citiesWithWeather = (await this.prisma.city.findMany()) as CityDto[];

    await this.cacheManager.set(cacheKey, citiesWithWeather);

    return citiesWithWeather;
  }

  async findAllWithWeather(): Promise<CityWithWeatherDto[]> {
    const cacheKey = 'all_cities_with_weather';
    const cachedData = await this.cacheManager.get<
      CityWithWeatherDto[]
    >(cacheKey);

    if (cachedData) {
      this.metricsService.cacheInteractions.inc({ cache_name: cacheKey, status: 'hit' });
      this.logger.debug(`Cache HIT for key: ${cacheKey}`);
      return cachedData;
    }

    this.metricsService.cacheInteractions.inc({ cache_name: cacheKey, status: 'miss' });
    this.logger.debug(`Cache MISS for key: ${cacheKey}`);
    const citiesWithWeather = (await this.prisma.city.findMany({
      include: {
        weather: {
          orderBy: { dataTime: 'desc' },
          take: 1,
        },
      },
    })) as CityWithWeatherDto[];

    await this.cacheManager.set(
      cacheKey,
      citiesWithWeather,
    );

    return citiesWithWeather;
  }

  async findByName(name: string) {
    return this.prisma.city.findUnique({ where: { name } });
  }

  async findByNameAndWeather7Days(name: string): Promise<CityWithWeatherDto> {
    const cacheKey = `city_with_7_weather_${name}`;
    const cachedData =
      await this.cacheManager.get<CityWithWeatherDto>(
        cacheKey,
      );

    if (cachedData) {
      this.metricsService.cacheInteractions.inc({ cache_name: 'city_with_7_weather_by_name', status: 'hit' });
      this.logger.debug(`Cache HIT for key: ${cacheKey}`);
      return cachedData;
    }

    this.metricsService.cacheInteractions.inc({ cache_name: 'city_with_7_weather_by_name', status: 'miss' });
    this.logger.debug(`Cache MISS for key: ${cacheKey}`);
    const cityWith7Weather = (await this.prisma.city.findUnique({
      where: { name },
      include: {
        weather: {
          where: {
            dataTime: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            },
          },
        },
      },
    })) as CityWithWeatherDto;

    await this.cacheManager.set(
      cacheKey,
      cityWith7Weather,
    );

    return cityWith7Weather;
  }

  async create(input: CreateCityDto): Promise<CityWithWeatherDto> {
    const existingCity = await this.findByName(input.name);
    if (existingCity) {
      throw new ConflictException('City already exists.');
    }

    try {
      const remoteData = await this.weatherService.fetchWeatherByCity(
        input.name,
        input.countryCode,
      );

      if (!remoteData?.city || !remoteData?.weather) {
        this.logger.error(
          `Failed to fetch weather/geo data for city: ${input.name} from remote API.`,
        );
        throw new InternalServerErrorException(
          `Could not fetch weather or geographical data for city "${input.name}". City not created.`,
        );
      }

      const newCity = await this.prisma.city.create({
        data: {
          name: input.name,
          latitude: remoteData.city.latitude,
          longitude: remoteData.city.longitude,
          countryCode: remoteData.city.countryCode,
          weather: {
            create: {
              dataTime: remoteData.weather[0].dataTime,
              temperature: remoteData.weather[0].temperature,
              humidity: remoteData.weather[0].humidity,
              windSpeed: remoteData.weather[0].windSpeed,
              description: remoteData.weather[0].description,
              pressure: remoteData.weather[0].pressure,
              feelsLike: remoteData.weather[0].feelsLike,
              visibility: remoteData.weather[0].visibility,
              sunrise: remoteData.weather[0].sunrise,
              sunset: remoteData.weather[0].sunset,
            },
          },
        },
        include: {
          weather: true,
        },
      });

      await this.cacheManager.del(`all_cities_with_weather`);
      this.logger.log('Cache invalidated for all_cities_with_weather due to new city creation.');

      return newCity as CityWithWeatherDto;

    } catch (error) {
      this.logger.error(`Unexpected error creating city ${input.name}:`, error.stack);
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the city.',
      );
    }
  }

  async delete(id: number) {
    const cityToDelete = await this.prisma.city.findUnique({ where: { id } });

    if (cityToDelete) {
      await this.prisma.city.delete({ where: { id } });
      await this.cacheManager.del('all_cities_with_weather');
      await this.cacheManager.del('all_cities');
      this.logger.log('Cache invalidated for all_cities_with_weather due to city deletion.');
      await this.cacheManager.del(`city_with_7_weather_${cityToDelete.name}`);
      this.logger.log(`Cache invalidated for city_with_7_weather_${cityToDelete.name} due to city deletion.`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async saveCurrentWeatherForAllCities() {
    this.logger.log('Cron job: Fetching latest weather data for all cities');

    const cities = await this.findAll();

    for (const city of cities) {
      try {
        await this.weatherService.fetchAndSaveCurrentWeatherForCity(city);
        await this.cacheManager.del(`city_with_7_weather_${city.name}`);
        this.logger.log(`Cache invalidated for city_with_7_weather_${city.name} due to cron update.`);
      } catch (error) {
        this.logger.error(`Error processing city ${city.name} in cron:`, error.stack);
      }
    }

    await this.cacheManager.del('all_cities_with_weather');
    this.logger.log('Cache invalidated for all_cities_with_weather due to cron update.');

    await this.findAllWithWeather();
    this.logger.log('Cache warmed up for all_cities_with_weather after cron job.');
  }
}
