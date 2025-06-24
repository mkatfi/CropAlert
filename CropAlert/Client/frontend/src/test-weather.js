// Quick test to verify weather API is working
const testWeatherAPI = async () => {
  const apiKey = '7WAQUA6C6NPPFALWDVMS9FMDP';
  const city = 'London';
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json&include=current`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Weather API Test Success:', {
      location: data.address,
      temperature: data.currentConditions.temp,
      conditions: data.currentConditions.conditions
    });
    return true;
  } catch (error) {
    console.error('Weather API Test Failed:', error);
    return false;
  }
};

// Run the test
testWeatherAPI();
