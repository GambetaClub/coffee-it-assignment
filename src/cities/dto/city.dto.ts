import { City } from '@prisma/client';

export class CityDto {
  id: number;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  countryCode?: string | null;
  stateCode?: string | null;

  static fromEntity(entity: City & { countryCode?: string | null; stateCode?: string | null }): CityDto {
    const dto = new CityDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.latitude = entity.latitude;
    dto.longitude = entity.longitude;
    dto.countryCode = entity.countryCode ?? (entity as any).country ?? null;
    dto.stateCode = entity.stateCode ?? null;
    return dto;
  }
} 