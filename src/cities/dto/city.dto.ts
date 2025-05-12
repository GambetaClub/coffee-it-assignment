import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the city' })
  id: number;

  @ApiProperty({ example: 'London', description: 'Name of the city' })
  name: string;

  @ApiPropertyOptional({
    example: 'GB',
    description: 'ISO 3166 country code (e.g., GB, US)',
  })
  countryCode?: string;
}