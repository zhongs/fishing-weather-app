import axios from 'axios';

// 使用 Netlify Function 作为代理
const PROXY_BASE = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions/qweather-proxy'
  : '/.netlify/functions/qweather-proxy';

/**
 * 获取实时天气
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
export const getNowWeather = async (latitude, longitude) => {
  try {
    const location = `${longitude.toFixed(2)},${latitude.toFixed(2)}`;
    const response = await axios.get(PROXY_BASE, {
      params: {
        endpoint: '/v7/weather/now',
        location
      }
    });
    
    if (response.data.code !== '200') {
      throw new Error(`API Error: ${response.data.code}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('获取实时天气失败:', error);
    throw error;
  }
};

/**
 * 获取7日天气预报
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
export const get7DayForecast = async (latitude, longitude) => {
  try {
    const location = `${longitude.toFixed(2)},${latitude.toFixed(2)}`;
    const response = await axios.get(PROXY_BASE, {
      params: {
        endpoint: '/v7/weather/7d',
        location
      }
    });
    
    if (response.data.code !== '200') {
      throw new Error(`API Error: ${response.data.code}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('获取7日预报失败:', error);
    throw error;
  }
};

/**
 * 将和风天气数据转换为应用使用的格式
 */
export const convertQWeatherToAppFormat = (nowData, forecastData, cityName) => {
  const now = nowData.now;
  
  // 当前天气数据
  const weatherData = {
    name: cityName,
    main: {
      temp: parseFloat(now.temp),
      feels_like: parseFloat(now.feelsLike),
      humidity: parseInt(now.humidity),
      pressure: parseFloat(now.pressure)
    },
    wind: {
      speed: Math.round(parseFloat(now.windSpeed) / 3.6 * 10) / 10 // 转换为 m/s，保留1位小数
    },
    weather: [{
      main: now.text,
      description: now.text
    }]
  };
  
  // 7天预报数据（跳过今天）
  const forecastDays = forecastData.daily.slice(1, 8).map(day => ({
    date: day.fxDate,
    temp: Math.round((parseInt(day.tempMax) + parseInt(day.tempMin)) / 2),
    tempMax: parseInt(day.tempMax),
    tempMin: parseInt(day.tempMin),
    windSpeed: Math.round(parseFloat(day.windSpeedDay) / 3.6 * 10) / 10, // 转换为 m/s，保留1位小数
    weatherCode: day.iconDay, // 使用和风天气的图标代码
    precipitation: parseFloat(day.precip),
    text: day.textDay,
    humidity: parseInt(day.humidity),
    pressure: parseFloat(day.pressure)
  }));
  
  return { weatherData, forecastDays };
};
