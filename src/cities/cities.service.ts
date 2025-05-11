import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { PrismaService } from '../database/prisma.service';
import { WeatherService } from '../weather/services/weather.service';
import { CityWithWeatherDto } from './dto/city-with-weather.dto';
import { CityDto } from './dto/city.dto';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CitiesService {

  private readonly logger = new Logger(CitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherService: WeatherService,
  ) {}

  async findAll(): Promise<CityDto[]> {
    const citiesWithWeather = await this.prisma.city.findMany() as CityDto[];

    return citiesWithWeather;
  }

  async findAllWithWeather(): Promise<CityWithWeatherDto[]> {
    const citiesWithWeather = await this.prisma.city.findMany({
      include: {
        weather: {
          orderBy: { dataTime: 'desc' },
          take: 1,
        },
      },
    }) as CityWithWeatherDto[];

    return citiesWithWeather;
  }

  async findByName(name: string) {
    return this.prisma.city.findUnique({ where: { name } });
  }

  async findByNameAndWeather7Days(name: string) {
    const cityWith7Weather = await this.prisma.city.findUnique({
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
    }) as CityWithWeatherDto;

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
        console.error(
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

      return newCity;
      
    } catch (error) {
      console.error(`Unexpected error creating city ${input.name}:`, error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the city.',
      );
    }
  }

  async delete(id: number) {
    return this.prisma.city.delete({ where: { id } });
  }


  @Cron(CronExpression.EVERY_10_SECONDS)
  async saveCurrentWeatherForAllCities() {
    this.logger.log('Cron job: Fetching latest weather data for all cities');

    const cities = await this.findAll();

    for (const city of cities) {
      await this.weatherService.fetchAndSaveCurrentWeatherForCity(city);
    }
  }
}
