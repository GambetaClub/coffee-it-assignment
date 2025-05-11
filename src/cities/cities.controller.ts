import { Controller, Get, Param, Post, Body, HttpStatus, HttpException, Delete, ParseIntPipe } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';

@Controller('cities')
export class CitiesController {

  constructor(private readonly citiesService: CitiesService){
  }

  @Get()
  async findAll() {
    return this.citiesService.findAll();
  }

  @Get('weather')
  async findAllWithWeather() {
    return this.citiesService.findAllWithWeather();
  }

  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get(':name/weather')
  async findByNameAndWeather7Days(@Param('name') name: string) {
    const city = await this.citiesService.findByNameAndWeather7Days(name);
    
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }
    return city;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.delete(id);
  }
}
