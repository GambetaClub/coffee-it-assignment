import { WeatherDto } from '../../weather/dto/weather.dto';
import { CityDto } from './city.dto';

export type CityWithWeatherDto = CityDto & { weather: WeatherDto[] };
