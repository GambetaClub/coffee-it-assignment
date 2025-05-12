import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Name of the city',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'AR',
    description: 'ISO 3166 country code (e.g., GB, US)',
    maxLength: 10, 
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  countryCode?: string;
}