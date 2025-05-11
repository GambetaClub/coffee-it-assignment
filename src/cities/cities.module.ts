import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from 'src/weather/weather.module';
@Module({
  imports: [HttpModule, PrismaModule, ConfigModule, WeatherModule],
  controllers: [CitiesController],
  providers: [CitiesService]
})
export class CitiesModule {}
