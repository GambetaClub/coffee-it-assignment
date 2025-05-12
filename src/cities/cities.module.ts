import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/database/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherModule } from 'src/weather/weather.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

const ttl = 60 * 60 * 1000; // 1 hour

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    ConfigModule,
    WeatherModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
        ttl: ttl,
      }),
    }),
  ],
  controllers: [CitiesController],
  providers: [CitiesService]
})
export class CitiesModule {}
