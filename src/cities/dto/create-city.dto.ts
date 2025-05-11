import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    example: 'London',
    description: 'Name of the city',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'GB',
    
    description: 'ISO 3166 country code (e.g., GB, US)',
    maxLength: 10, // Adjusted for potential longer codes, though typically 2-3 chars
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  countryCode?: string;
}