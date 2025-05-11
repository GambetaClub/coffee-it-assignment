// src/weather/services/openweathermap.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { WeatherDto } from '../dto/weather.dto';

// Interface for the combined response
export interface GeoAndWeatherData {
  city: {
    name: string;
    latitude: number;
    longitude: number;
    countryCode: string; // e.g., "GB", "US"
  };
  weather: WeatherDto[];
}

@Injectable()
export class OpenWeatherMapService {
  private readonly logger = new Logger(OpenWeatherMapService.name);
  private readonly apiKey: string;
  private readonly units: string = 'metric';
  private readonly baseUrl: string = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPEN_WEATHER_MAP_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.error('OPEN_WEATHER_MAP_API_KEY is not configured!');
    }
  }

  private async fetchRawWeatherData(cityName: string, countryCode?: string): Promise<GeoAndWeatherData | null> {
    if (!this.apiKey) {
        this.logger.error('OpenWeatherMap API key is missing. Cannot fetch weather data.');
        return null;
    }
    const params: any = { 
      appid: this.apiKey,
      units: this.units,
    };

    if (countryCode) {
      params.q = `${cityName},${countryCode}`;
    } else {
      params.q = cityName;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, { params }),
      );
      if (response.data.cod !== 200 && response.data.message) {
          this.logger.warn(`OpenWeatherMap API error for city "${cityName}": ${response.data.message} (Code: ${response.data.cod})`);
          return null;
      }
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching weather data for city "${cityName}": ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(`API Response Status: ${error.response.status}`);
        this.logger.error(`API Response Data: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  private transformRawToGeoAndWeatherData(rawData: any): GeoAndWeatherData | null {
    if (!rawData || typeof rawData.main === 'undefined') {
      this.logger.warn('Invalid or incomplete raw weather data received for transformation.');
      return null;
    }

    try {
      const weatherDto = new WeatherDto();
      weatherDto.temperature = rawData.main.temp;
      weatherDto.feelsLike = rawData.main.feels_like
      weatherDto.pressure = rawData.main.pressure
      weatherDto.humidity = rawData.main.humidity
      weatherDto.windSpeed = rawData.wind?.speed
      weatherDto.description = rawData.weather?.[0]?.description 
      weatherDto.visibility = rawData.visibility
      weatherDto.sunrise = rawData.sys?.sunrise
      weatherDto.sunset = rawData.sys?.sunset
      weatherDto.dataTime = new Date(rawData.dt * 1000);
      
      return {
        city: {
          latitude: rawData.coord?.lat,
          longitude: rawData.coord?.lon,
          name: rawData.name,
          countryCode: rawData.sys?.country,
        },
        weather: [weatherDto],
      };


    } catch (error) {
        this.logger.error(`Error transforming raw weather data: ${error.message}`, error.stack);
        return null;
    }
  }

  async getCurrentWeatherByCity(cityName: string, countryCode?: string): Promise<GeoAndWeatherData | null> {
    const rawData = await this.fetchRawWeatherData(cityName, countryCode);
    if (!rawData) {
      return null;
    }
    return this.transformRawToGeoAndWeatherData(rawData);
  }
}
