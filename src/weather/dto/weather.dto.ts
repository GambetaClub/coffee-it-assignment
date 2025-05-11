import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeatherDto {
  @ApiPropertyOptional({ example: 1, description: 'Unique identifier for the weather data record' })
  id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Foreign key referencing the city' })
  cityId?: number;

  @ApiProperty({ example: 25.5, description: 'Temperature in Celsius' })
  temperature: number; 

  @ApiPropertyOptional({ example: 26.1, description: 'Feels like temperature in Celsius', nullable: true })
  feelsLike: number | null;

  @ApiPropertyOptional({ example: 1012, description: 'Atmospheric pressure in hPa', nullable: true })
  pressure: number | null;

  @ApiPropertyOptional({ example: 60, description: 'Humidity percentage', nullable: true })
  humidity: number | null;

  @ApiPropertyOptional({ example: 5.5, description: 'Wind speed in meter/sec', nullable: true })
  windSpeed: number | null;

  @ApiPropertyOptional({ example: 'clear sky', description: 'Weather condition description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 10000, description: 'Visibility in meters', nullable: true })
  visibility: number | null; 

  @ApiPropertyOptional({ example: 1678886400, description: 'Sunrise time, Unix, UTC', nullable: true })
  sunrise: number | null; 

  @ApiPropertyOptional({ example: 1678929600, description: 'Sunset time, Unix, UTC', nullable: true })
  sunset: number | null; 

  @ApiProperty({ example: '2023-03-15T12:00:00.000Z', description: 'Data receiving time from API (UTC)' })
  dataTime: Date; 
  
  @ApiPropertyOptional({ example: '2023-03-15T12:05:00.000Z', description: 'Timestamp of when the record was created in our database' })
  createdAt?: Date; 
}
