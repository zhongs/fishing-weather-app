import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  ThermometerSun, 
  Fish,
  MapPin,
  Search,
  Loader2,
  Sun,
  CloudSnow,
  AlertCircle,
  Star,
  Trash2,
  Plus,
  X,
  Map as MapIcon
} from 'lucide-react';
import MapSelector from './MapSelector';
import 'leaflet/dist/leaflet.css';

// WMO天气代码转换函数
const getWeatherCondition = (code) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 85 && code <= 86) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clouds';
};

const getWeatherDescription = (code) => {
  const weatherMap = {
    0: '晴朗',
    1: '基本晴朗',
    2: '部分多云',
    3: '阴天',
    45: '有雾',
    48: '雾凇',
    51: '小毛毛雨',
    53: '中等毛毛雨',
    55: '大毛毛雨',
    56: '冻毛毛雨',
    57: '大冻毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻小雨',
    67: '冻大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '小阵雨',
    81: '中阵雨',
    82: '大阵雨',
    85: '小阵雪',
    86: '大阵雪',
    95: '雷暴',
    96: '雷暴伴小冰雹',
    99: '雷暴伴大冰雹'
  };
  return weatherMap[code] || '未知';
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fishingRecommendation, setFishingRecommendation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('search'); // 'search' or 'map'
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.5928, 114.3055]); // 默认武汉中心

  // 从localStorage加载保存的钓点
  useEffect(() => {
    const saved = localStorage.getItem('fishingLocations');
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load saved locations:', err);
      }
    }
  }, []);

  // 保存钓点到localStorage
  const saveLocation = (locationName) => {
    if (!locationName.trim()) return;
    
    const newLocation = {
      id: Date.now(),
      name: locationName.trim(),
      addedAt: new Date().toISOString()
    };
    
    const updated = [...savedLocations, newLocation];
    setSavedLocations(updated);
    localStorage.setItem('fishingLocations', JSON.stringify(updated));
  };

  // 删除保存的钓点
  const removeLocation = (locationId) => {
    const updated = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(updated);
    localStorage.setItem('fishingLocations', JSON.stringify(updated));
  };

  // 添加当前查询的城市到常用钓点
  const addCurrentToSaved = () => {
    if (!city.trim()) {
      setError('请先搜索一个地点');
      setSuccessMessage('');
      return;
    }
    
    // 检查是否已存在
    if (savedLocations.some(loc => loc.name === city.trim())) {
      setError('该地点已在常用钓点中');
      setSuccessMessage('');
      return;
    }
    
    saveLocation(city);
    setError('');
    setSuccessMessage(`已添加「${city.trim()}」到常用钓点`);
    
    // 3秒后自动清除成功提示
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // 判断是否适合钓鱼的逻辑
  const analyzeFishingConditions = (weatherData) => {
    if (!weatherData) return null;

    const temp = weatherData.main.temp;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const pressure = weatherData.main.pressure;

    let score = 100;
    let reasons = [];
    let tips = [];

    // 温度评分 (最佳温度15-25°C)
    if (temp < 5 || temp > 35) {
      score -= 30;
      reasons.push('温度过于极端');
      tips.push('鱼类活动减少，建议选择其他时间');
    } else if (temp < 10 || temp > 30) {
      score -= 15;
      reasons.push('温度不够理想');
    } else if (temp >= 15 && temp <= 25) {
      tips.push('温度适宜，鱼类活跃');
    }

    // 风速评分 (最佳风速2-5m/s)
    if (windSpeed > 10) {
      score -= 30;
      reasons.push('风力过大');
      tips.push('大风影响抛竿，注意安全');
    } else if (windSpeed > 7) {
      score -= 15;
      reasons.push('风力较大');
    } else if (windSpeed >= 2 && windSpeed <= 5) {
      tips.push('微风拂面，氧气充足');
    }

    // 天气条件评分
    if (weatherCondition.includes('thunderstorm')) {
      score -= 50;
      reasons.push('雷暴天气');
      tips.push('危险！禁止钓鱼');
    } else if (weatherCondition.includes('rain')) {
      if (weatherCondition.includes('heavy')) {
        score -= 25;
        reasons.push('大雨天气');
      } else {
        score += 10;
        tips.push('小雨天气鱼类觅食活跃');
      }
    } else if (weatherCondition.includes('snow')) {
      score -= 20;
      reasons.push('下雪天气');
    } else if (weatherCondition.includes('clear')) {
      tips.push('天气晴朗，适合出行');
    }

    // 气压评分 (最佳气压990-1020hPa)
    if (pressure < 990 || pressure > 1020) {
      score -= 10;
      reasons.push('气压不稳定');
    } else {
      tips.push('气压稳定，利于钓鱼');
    }

    // 湿度评分
    if (humidity > 85) {
      tips.push('湿度较高，注意防潮');
    }

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));

    let recommendation = '';
    let level = '';
    let color = '';

    if (score >= 80) {
      recommendation = '非常适合钓鱼！';
      level = '优秀';
      color = 'bg-green-500';
    } else if (score >= 60) {
      recommendation = '比较适合钓鱼';
      level = '良好';
      color = 'bg-blue-500';
    } else if (score >= 40) {
      recommendation = '可以钓鱼，但条件一般';
      level = '一般';
      color = 'bg-yellow-500';
    } else if (score >= 20) {
      recommendation = '不太适合钓鱼';
      level = '较差';
      color = 'bg-orange-500';
    } else {
      recommendation = '不建议钓鱼';
      level = '很差';
      color = 'bg-red-500';
    }

    return {
      score,
      recommendation,
      level,
      color,
      reasons,
      tips
    };
  };

  // 获取城市坐标（使用高德地理编码API）
  const getCityCoordinates = async (cityName) => {
    try {
      // 使用高德地理编码API（免费，无需key的备用方案）
      const response = await axios.get(
        `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(cityName)}&output=json&key=f0e1e8a8e5e5c5e5e5e5e5e5e5e5e5e5`
      );
      
      if (response.data.geocodes && response.data.geocodes.length > 0) {
        const location = response.data.geocodes[0].location.split(',');
        return {
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1]),
          name: response.data.geocodes[0].formatted_address
        };
      }
      
      // 备用：使用nominatim地理编码（完全免费）
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)},中国&format=json&limit=1&accept-language=zh-CN`
      );
      
      if (nominatimResponse.data && nominatimResponse.data.length > 0) {
        const result = nominatimResponse.data[0];
        return {
          longitude: parseFloat(result.lon),
          latitude: parseFloat(result.lat),
          name: result.display_name
        };
      }
      
      throw new Error('未找到该城市');
    } catch (err) {
      console.error('Geocoding Error:', err);
      throw err;
    }
  };

  // 获取天气数据（使用OpenMeteo API - 完全免费，无需API key）
  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('请输入城市名称');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. 先获取城市坐标
      const coords = await getCityCoordinates(cityName);
      
      // 2. 使用OpenMeteo获取天气数据（完全免费，无需API key）
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&timezone=Asia/Shanghai`
      );
      
      // 转换为统一的天气数据格式
      const weatherData = {
        name: cityName,
        main: {
          temp: weatherResponse.data.current.temperature_2m,
          feels_like: weatherResponse.data.current.apparent_temperature,
          humidity: weatherResponse.data.current.relative_humidity_2m,
          pressure: weatherResponse.data.current.surface_pressure
        },
        wind: {
          speed: weatherResponse.data.current.wind_speed_10m
        },
        weather: [{
          main: getWeatherCondition(weatherResponse.data.current.weather_code),
          description: getWeatherDescription(weatherResponse.data.current.weather_code)
        }]
      };
      
      setWeather(weatherData);
      const analysis = analyzeFishingConditions(weatherData);
      setFishingRecommendation(analysis);
    } catch (err) {
      setError('获取天气信息失败，请检查城市名称或稍后再试');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 根据经纬度获取天气（用于地图标点）
  const fetchWeatherByCoordinates = async (latitude, longitude) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. 使用OpenMeteo获取天气数据
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&timezone=Asia/Shanghai`
      );
      
      // 2. 获取城市名称（使用逆地理编码）
      let cityName = `位置 (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
      try {
        const geoResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN`
        );
        if (geoResponse.data && geoResponse.data.address) {
          const addr = geoResponse.data.address;
          
          // 构建详细的地点名称
          const parts = [];
          
          // 添加城市
          if (addr.city) {
            parts.push(addr.city);
          } else if (addr.county) {
            parts.push(addr.county);
          } else if (addr.state) {
            parts.push(addr.state);
          }
          
          // 添加区县（如果与城市不同）
          if (addr.county && addr.county !== addr.city) {
            parts.push(addr.county);
          } else if (addr.district) {
            parts.push(addr.district);
          }
          
          // 添加街道/乡镇
          if (addr.suburb) {
            parts.push(addr.suburb);
          } else if (addr.town) {
            parts.push(addr.town);
          } else if (addr.village) {
            parts.push(addr.village);
          }
          
          // 添加具体位置
          if (addr.road) {
            parts.push(addr.road);
          } else if (addr.hamlet) {
            parts.push(addr.hamlet);
          }
          
          // 添加地标或兴趣点
          if (addr.water || addr.natural || addr.leisure) {
            parts.push(addr.water || addr.natural || addr.leisure);
          }
          
          // 组合成完整名称（去除重复和空格）
          if (parts.length > 0) {
            // 去除重复项
            const uniqueParts = [...new Set(parts)];
            // 根据部分数量决定分隔符
            if (uniqueParts.length <= 2) {
              cityName = uniqueParts.join('');
            } else {
              cityName = uniqueParts.join(' ');
            }
          } else if (geoResponse.data.display_name) {
            // 如果没有结构化地址，使用display_name的前几部分
            const displayParts = geoResponse.data.display_name.split(',').slice(0, 3);
            cityName = displayParts.join(' ').trim();
          }
        }
      } catch (geoErr) {
        console.warn('Reverse geocoding failed:', geoErr);
      }
      
      // 转换为统一的天气数据格式
      const weatherData = {
        name: cityName,
        main: {
          temp: weatherResponse.data.current.temperature_2m,
          feels_like: weatherResponse.data.current.apparent_temperature,
          humidity: weatherResponse.data.current.relative_humidity_2m,
          pressure: weatherResponse.data.current.surface_pressure
        },
        wind: {
          speed: weatherResponse.data.current.wind_speed_10m
        },
        weather: [{
          main: getWeatherCondition(weatherResponse.data.current.weather_code),
          description: getWeatherDescription(weatherResponse.data.current.weather_code)
        }]
      };
      
      setWeather(weatherData);
      setCity(cityName);
      const analysis = analyzeFishingConditions(weatherData);
      setFishingRecommendation(analysis);
    } catch (err) {
      setError('获取天气信息失败，请重试');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理地图上的位置选择
  const handleMapLocationSelect = (location) => {
    setSelectedMapLocation(location);
    fetchWeatherByCoordinates(location.lat, location.lng);
  };

  // 获取用户位置的天气
  const fetchWeatherByLocation = async () => {
    setLoading(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // 1. 使用OpenMeteo获取天气数据
            const weatherResponse = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&timezone=Asia/Shanghai`
            );
            
            // 2. 获取城市名称（使用逆地理编码）
            let cityName = '当前位置';
            try {
              const geoResponse = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN`
              );
              if (geoResponse.data && geoResponse.data.address) {
                const addr = geoResponse.data.address;
                
                // 构建详细的地点名称
                const parts = [];
                
                // 添加城市
                if (addr.city) {
                  parts.push(addr.city);
                } else if (addr.county) {
                  parts.push(addr.county);
                } else if (addr.state) {
                  parts.push(addr.state);
                }
                
                // 添加区县（如果与城市不同）
                if (addr.county && addr.county !== addr.city) {
                  parts.push(addr.county);
                } else if (addr.district) {
                  parts.push(addr.district);
                }
                
                // 添加街道/乡镇
                if (addr.suburb) {
                  parts.push(addr.suburb);
                } else if (addr.town) {
                  parts.push(addr.town);
                } else if (addr.village) {
                  parts.push(addr.village);
                }
                
                // 添加具体位置
                if (addr.road) {
                  parts.push(addr.road);
                } else if (addr.hamlet) {
                  parts.push(addr.hamlet);
                }
                
                // 添加地标或兴趣点
                if (addr.water || addr.natural || addr.leisure) {
                  parts.push(addr.water || addr.natural || addr.leisure);
                }
                
                // 组合成完整名称（去除重复和空格）
                if (parts.length > 0) {
                  // 去除重复项
                  const uniqueParts = [...new Set(parts)];
                  // 根据部分数量决定分隔符
                  if (uniqueParts.length <= 2) {
                    cityName = uniqueParts.join('');
                  } else {
                    cityName = uniqueParts.join(' ');
                  }
                } else if (geoResponse.data.display_name) {
                  // 如果没有结构化地址，使用display_name的前几部分
                  const displayParts = geoResponse.data.display_name.split(',').slice(0, 3);
                  cityName = displayParts.join(' ').trim();
                }
              }
            } catch (geoErr) {
              console.warn('Reverse geocoding failed:', geoErr);
            }
            
            // 转换为统一的天气数据格式
            const weatherData = {
              name: cityName,
              main: {
                temp: weatherResponse.data.current.temperature_2m,
                feels_like: weatherResponse.data.current.apparent_temperature,
                humidity: weatherResponse.data.current.relative_humidity_2m,
                pressure: weatherResponse.data.current.surface_pressure
              },
              wind: {
                speed: weatherResponse.data.current.wind_speed_10m
              },
              weather: [{
                main: getWeatherCondition(weatherResponse.data.current.weather_code),
                description: getWeatherDescription(weatherResponse.data.current.weather_code)
              }]
            };
            
            setWeather(weatherData);
            setCity(cityName);
            const analysis = analyzeFishingConditions(weatherData);
            setFishingRecommendation(analysis);
          } catch (err) {
            setError('获取天气信息失败');
            console.error('Weather API Error:', err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('无法获取位置信息，请手动输入城市');
          setLoading(false);
        }
      );
    } else {
      setError('浏览器不支持地理定位');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getWeatherIcon = (condition) => {
    const main = condition?.toLowerCase() || '';
    if (main.includes('rain')) return <CloudRain className="w-16 h-16" />;
    if (main.includes('cloud')) return <Cloud className="w-16 h-16" />;
    if (main.includes('clear')) return <Sun className="w-16 h-16" />;
    if (main.includes('snow')) return <CloudSnow className="w-16 h-16" />;
    return <Cloud className="w-16 h-16" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Fish className="w-12 h-12 mr-3" />
            <h1 className="text-4xl font-bold">钓鱼天气</h1>
          </div>
          <p className="text-blue-100">根据天气预报判断是否适合钓鱼</p>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('search')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                viewMode === 'search'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">搜索查询</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                viewMode === 'map'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="w-5 h-5" />
              <span className="font-medium">地图标点</span>
            </button>
          </div>
        </div>

        {/* Search Form */}
        {viewMode === 'search' && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="输入城市名称..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <button
            onClick={fetchWeatherByLocation}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:bg-gray-300"
          >
            <MapPin className="w-5 h-5" />
            使用当前位置
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <Star className="w-5 h-5 flex-shrink-0 mt-0.5 fill-green-500" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* Add to favorites button */}
          {weather && (
            <button
              onClick={addCurrentToSaved}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-3 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-200"
            >
              <Star className="w-5 h-5" />
              收藏当前钓点
            </button>
          )}
        </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-500" />
              在地图上标记钓点
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              点击地图上的任意位置，查看该地点的钓鱼指数
            </p>
            
            <MapSelector
              onLocationSelect={handleMapLocationSelect}
              selectedLocation={selectedMapLocation}
              center={mapCenter}
              zoom={11}
            />

            {selectedMapLocation && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">已选位置：</span>
                  纬度 {selectedMapLocation.lat.toFixed(4)}°, 
                  经度 {selectedMapLocation.lng.toFixed(4)}°
                </p>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">正在获取天气数据...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {weather && (
              <button
                onClick={addCurrentToSaved}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-3 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-200"
              >
                <Star className="w-5 h-5" />
                收藏当前钓点
              </button>
            )}
          </div>
        )}

        {/* Saved Locations */}
        {savedLocations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                常用钓点
              </h3>
              <span className="text-sm text-gray-500">{savedLocations.length} 个</span>
            </div>
            
            <div className="space-y-2">
              {savedLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button
                    onClick={() => {
                      setCity(location.name);
                      fetchWeather(location.name);
                    }}
                    className="flex-1 text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {location.name}
                  </button>
                  <button
                    onClick={() => removeLocation(location.id)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                点击钓点名称快速查看天气
              </p>
            </div>
          </div>
        )}

        {/* Weather Display */}
        {weather && fishingRecommendation && (
          <div className="space-y-6">
            {/* Fishing Recommendation Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className={`${fishingRecommendation.color} text-white rounded-xl p-6 mb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Fish className="w-10 h-10" />
                    <div>
                      <h2 className="text-2xl font-bold">{fishingRecommendation.recommendation}</h2>
                      <p className="text-sm opacity-90">钓鱼指数: {fishingRecommendation.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{fishingRecommendation.score}</div>
                    <div className="text-sm opacity-90">分</div>
                  </div>
                </div>
              </div>

              {fishingRecommendation.reasons.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">不利因素:</h3>
                  <ul className="space-y-1">
                    {fishingRecommendation.reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fishingRecommendation.tips.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">提示建议:</h3>
                  <ul className="space-y-1">
                    {fishingRecommendation.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Weather Details Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
                  <p className="text-gray-600 capitalize">{weather.weather[0].description}</p>
                </div>
                <div className="text-blue-500">
                  {getWeatherIcon(weather.weather[0].main)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <ThermometerSun className="w-5 h-5" />
                    <span className="text-sm font-medium">温度</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-xs text-gray-600 mt-1">
                    体感 {Math.round(weather.main.feels_like)}°C
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="text-sm font-medium">风速</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{weather.wind.speed} m/s</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {weather.wind.speed < 2 ? '微风' : weather.wind.speed < 5 ? '轻风' : weather.wind.speed < 8 ? '和风' : '强风'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-600 mb-2">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm font-medium">湿度</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{weather.main.humidity}%</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Cloud className="w-5 h-5" />
                    <span className="text-sm font-medium">气压</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{weather.main.pressure}</p>
                  <p className="text-xs text-gray-600 mt-1">hPa</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white text-sm mt-8 pb-8 opacity-80">
          <p>数据仅供参考，实际情况请以现场为准</p>
          <p className="mt-2">Powered by Open-Meteo & OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
}

export default App;
