// Simple test script to verify weather service functionality
import { weatherService } from '../services/weatherService';

// Test the weather service
async function testWeatherService() {
  try {
    console.log('Testing weather service...');
    
    // Test 1: Get weather by city
    console.log('1. Testing weather by city (London)...');
    const londonWeather = await weatherService.getWeatherByCity('London');
    console.log('London weather:', {
      address: londonWeather.address,
      temp: londonWeather.currentConditions.temp,
      conditions: londonWeather.currentConditions.conditions
    });
    
    // Test 2: Get weather by coordinates (New York)
    console.log('2. Testing weather by coordinates (New York)...');
    const nycWeather = await weatherService.getWeatherByCoordinates(40.7128, -74.0060);
    console.log('NYC weather:', {
      address: nycWeather.address,
      temp: nycWeather.currentConditions.temp,
      conditions: nycWeather.currentConditions.conditions
    });
    
    // Test 3: Get weather for multiple locations
    console.log('3. Testing weather for multiple locations...');
    const locations = [
      { latitude: 51.5074, longitude: -0.1278, name: 'London' },
      { latitude: 40.7128, longitude: -74.0060, name: 'New York' },
      { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo' }
    ];
    
    const multipleWeather = await weatherService.getWeatherForMultipleLocations(locations);
    multipleWeather.forEach(locationWeather => {
      console.log(`${locationWeather.location}:`, {
        temp: locationWeather.weather.currentConditions.temp,
        conditions: locationWeather.weather.currentConditions.conditions
      });
    });
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in components
export { testWeatherService };
