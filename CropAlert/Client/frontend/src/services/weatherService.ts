import axios from 'axios';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '7WAQUA6C6NPPFALWDVMS9FMDP';
const WEATHER_BASE_URL = process.env.REACT_APP_WEATHER_API_URL || 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export interface WeatherData {
  address: string;
  description: string;
  days: WeatherDay[];
  currentConditions: CurrentConditions;
}

export interface WeatherDay {
  datetime: string;
  tempmax: number;
  tempmin: number;
  temp: number;
  humidity: number;
  precip: number;
  windspeed: number;
  conditions: string;
  description: string;
  icon: string;
}

export interface CurrentConditions {
  datetime: string;
  temp: number;
  humidity: number;
  precip: number;
  windspeed: number;
  conditions: string;
  icon: string;
}

export interface LocationWeather {
  location: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
}

class WeatherService {
  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${WEATHER_BASE_URL}/${latitude},${longitude}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json&include=days,current`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${WEATHER_BASE_URL}/${encodeURIComponent(city)}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json&include=days,current`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForMultipleLocations(locations: Array<{ latitude: number; longitude: number; name?: string }>): Promise<LocationWeather[]> {
    try {
      const weatherPromises = locations.map(async (location) => {
        const weather = await this.getWeatherByCoordinates(location.latitude, location.longitude);
        return {
          location: location.name || `${location.latitude}, ${location.longitude}`,
          latitude: location.latitude,
          longitude: location.longitude,
          weather
        };
      });

      return await Promise.all(weatherPromises);
    } catch (error) {
      console.error('Error fetching weather for multiple locations:', error);
      throw new Error('Failed to fetch weather data for locations');
    }
  }

  getWeatherIcon(iconCode: string): string {
    // Map Visual Crossing icons to weather emoji or icon URLs
    const iconMap: { [key: string]: string } = {
      'clear-day': '☀️',
      'clear-night': '🌙',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '☁️',
      'cloudy': '☁️',
      'rain': '🌧️',
      'snow': '❄️',
      'wind': '💨',
      'fog': '🌫️'
    };

    return iconMap[iconCode] || '🌤️';
  }

  formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  formatWindSpeed(speed: number): string {
    return `${Math.round(speed)} km/h`;
  }

  formatHumidity(humidity: number): string {
    return `${Math.round(humidity)}%`;
  }
}

export const weatherService = new WeatherService();
