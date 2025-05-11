import { Injectable, Logger } from '@nestjs/common';
import {
  GeoAndWeatherData,
  OpenWeatherMapService,
} from './openweathermap.service';
import { WeatherDto } from '../dto/weather.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CityDto } from 'src/cities/dto/city.dto';


export interface StoredWeatherDataAndGeo {
  storedWeatherDto: WeatherDto;
  latitude?: number;
  longitude?: number;
  countryCode?: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly openWeatherMapService: OpenWeatherMapService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    cityId: number,
    weatherDto: WeatherDto,
  ): Promise<WeatherDto> {
    try {
      this.logger.log(
        `Creating weather data for city ${cityId} with dataTime: ${weatherDto.dataTime}`,
      );
      const newWeather = await this.prisma.weather.create({
        data: {
          cityId: cityId,
          temperature: weatherDto.temperature,
          feelsLike: weatherDto.feelsLike,
          pressure: weatherDto.pressure,
          humidity: weatherDto.humidity,
          windSpeed: weatherDto.windSpeed,
          description: weatherDto.description,
          visibility: weatherDto.visibility,
          sunrise: weatherDto.sunrise,
          sunset: weatherDto.sunset,
          dataTime: weatherDto.dataTime,
          // createdAt is handled by @default(now()) in Prisma schema
        },
      });
      return newWeather as WeatherDto;
    } catch (error) {
      this.logger.error(
        `Error creating weather data for city ${cityId}: ${error}`,
      );
      throw error;
    }
  }

  async fetchWeatherByCity(
    cityName: string,
    countryCode?: string,
  ): Promise<GeoAndWeatherData | null> {
    this.logger.log(
      `Fetching remote geo and weather data for city name: ${cityName}`,
    );
    const apiResponse = await this.openWeatherMapService.getCurrentWeatherByCity(
      cityName,
      countryCode,
    );

    if (!apiResponse?.city || !apiResponse.weather) {
      this.logger.warn(
        `Could not fetch remote geo and weather data from API for city: ${cityName}`,
      );
      return null;
    }
    return apiResponse;
  }

  async fetchAndSaveCurrentWeatherForCity(city: CityDto): Promise<WeatherDto | null> {
    this.logger.log(`Cron: Attempting to fetch and save weather for city: ${city.name} (ID: ${city.id})`);
    
    const geoAndWeatherData = await this.openWeatherMapService.getCurrentWeatherByCity(
      city.name,
      city.countryCode || undefined
    );

    if (!geoAndWeatherData || !geoAndWeatherData.weather) {
      this.logger.warn(`Cron: Could not fetch remote weather for city: ${city.name}`);
      return null;
    }

    try {
      return await this.create(city.id, geoAndWeatherData.weather[0]);
    } catch (error) {
        this.logger.error(`Error creating weather data for city ${city.id}: ${error}`);
        return null;
    }

  }

}
