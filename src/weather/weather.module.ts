import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; 
import { PrismaModule } from '../database/prisma.module';
import { OpenWeatherMapService } from './services/openweathermap.service';
import { WeatherService } from './services/weather.service';

@Module({
  imports: [
    HttpModule,  
    ConfigModule, 
    PrismaModule, 
  ],
  providers: [
    OpenWeatherMapService,
    WeatherService,     
  ],
  exports: [
    WeatherService,
    OpenWeatherMapService,  
  ],
})
export class WeatherModule {}
