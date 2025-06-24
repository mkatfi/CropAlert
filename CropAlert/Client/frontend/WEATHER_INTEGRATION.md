# Weather Integration for CropAlert Dashboard

This integration adds comprehensive weather information to the CropAlert dashboard using the Visual Crossing Weather API.

## Features

### 🌤️ Weather Services
- **Real-time Weather Data**: Get current weather conditions for any location
- **Location-based Weather**: Weather by coordinates or city name
- **Multiple Location Support**: Fetch weather for multiple locations simultaneously
- **Weather Forecasting**: Access to extended weather forecasts

### 🗺️ Enhanced Map View
- **Weather-enabled Alert Markers**: Click on alert markers to see weather information
- **Weather Popups**: Detailed weather information in map popups
- **Location Weather**: Weather data for alert locations and user location

### 📊 Weather Dashboard
- **Weather Cards**: Beautiful weather cards for multiple locations
- **Add Cities**: Add weather information for any city
- **Refresh Weather**: Update weather data in real-time
- **Weather Stats**: Weather information integrated into dashboard stats

### 🎯 Weather Widget
- **Compact Weather Display**: Small weather widget for sidebars
- **Full Weather Cards**: Detailed weather information cards
- **Responsive Design**: Works on all screen sizes

## API Integration

### Weather API Details
- **Provider**: Visual Crossing Weather Services
- **API Key**: `7WAQUA6C6NPPFALWDVMS9FMDP`
- **Base URL**: `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline`
- **Units**: Metric (Celsius, km/h, mm)

### Weather Data Structure
```typescript
interface WeatherData {
  address: string;
  description: string;
  days: WeatherDay[];
  currentConditions: CurrentConditions;
}

interface CurrentConditions {
  datetime: string;
  temp: number;
  humidity: number;
  precip: number;
  windspeed: number;
  conditions: string;
  icon: string;
}
```

## Components

### 1. WeatherService (`/src/services/weatherService.ts`)
Main service for weather API interactions:
- `getWeatherByCoordinates(lat, lon)` - Get weather by GPS coordinates
- `getWeatherByCity(city)` - Get weather by city name
- `getWeatherForMultipleLocations(locations)` - Batch weather requests
- Utility functions for formatting temperature, wind speed, etc.

### 2. WeatherCard (`/src/components/WeatherCard.tsx`)
Beautiful weather display component:
- Full weather information display
- Compact mode for smaller spaces
- Animated weather icons
- Gradient backgrounds

### 3. WeatherDashboard (`/src/components/WeatherDashboard.tsx`)
Complete weather dashboard:
- Multiple location weather tracking
- Add/remove cities
- Refresh weather data
- Integration with alert locations

### 4. WeatherWidget (`/src/components/WeatherWidget.tsx`)
Flexible weather widget:
- Compact or full display modes
- Location or city-based weather
- Error handling and loading states

### 5. Enhanced MapView (`/src/components/MapView.tsx`)
Map with weather integration:
- Weather data in alert popups
- Click to load weather information
- Weather icons and data display

## Usage Examples

### Basic Weather Service Usage
```typescript
import { weatherService } from '../services/weatherService';

// Get weather by city
const weather = await weatherService.getWeatherByCity('London');

// Get weather by coordinates
const weather = await weatherService.getWeatherByCoordinates(40.7128, -74.0060);

// Format temperature
const tempString = weatherService.formatTemperature(25.5); // "26°C"
```

### Using Weather Components
```tsx
// Weather Widget
<WeatherWidget city="London" compact={true} />

// Weather Card
<WeatherCard weather={weatherData} />

// Weather Dashboard
<WeatherDashboard alerts={alerts} userLocation={userLocation} />
```

### Enhanced Map with Weather
```tsx
// Map with weather popups
<MapView 
  alerts={alerts} 
  userLocation={userLocation} 
  showWeather={true} 
/>
```

## Environment Variables

Add to your `.env` file:
```
REACT_APP_WEATHER_API_KEY=7WAQUA6C6NPPFALWDVMS9FMDP
REACT_APP_WEATHER_API_URL=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline
```

## Weather Icons

The system includes weather icon mapping:
- ☀️ Clear day
- 🌙 Clear night
- ⛅ Partly cloudy
- ☁️ Cloudy
- 🌧️ Rain
- ❄️ Snow
- 💨 Windy
- 🌫️ Foggy

## Error Handling

The weather integration includes comprehensive error handling:
- Network error handling
- API rate limiting
- Invalid location handling
- Graceful fallbacks

## Performance Optimizations

- **Caching**: Weather data is cached to reduce API calls
- **Lazy Loading**: Weather data loads on demand
- **Batch Requests**: Multiple locations fetched efficiently
- **Background Updates**: Weather refreshes in background

## Integration Points

### Dashboard Integration
- Weather stats in dashboard statistics
- Weather cards for alert locations
- User location weather display

### Alert Integration
- Weather information in alert popups
- Weather context for crop alerts
- Location-based weather recommendations

### Map Integration
- Weather overlays on map
- Click-to-load weather functionality
- Weather markers and popups

## Testing

Use the test utility to verify weather functionality:
```typescript
import { testWeatherService } from '../utils/testWeather';
testWeatherService();
```

## Styling

Weather components use:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Custom gradients** for weather cards

## API Limits

Visual Crossing Weather API:
- **Free Tier**: 1000 requests/day
- **Rate Limit**: 1 request/second
- **Data Retention**: Current + 15 days forecast

## Future Enhancements

Planned improvements:
- Weather alerts and warnings
- Historical weather data
- Weather-based crop recommendations
- Advanced weather analytics
- Weather notification system

## Troubleshooting

Common issues and solutions:

### CORS Issues
- Weather API supports CORS for browser requests
- No proxy server needed

### API Key Issues
- Verify API key in environment variables
- Check API key permissions

### Location Issues
- Ensure coordinates are valid (lat: -90 to 90, lon: -180 to 180)
- City names should be in English
- Use full city names for better accuracy

### Performance Issues
- Limit concurrent weather requests
- Implement request caching
- Use batch requests for multiple locations
