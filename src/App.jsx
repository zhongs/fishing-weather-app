import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Fish, Search, Map as MapIcon, Star } from 'lucide-react';
import MapSelector from './MapSelector';
import SearchPanel from './components/SearchPanel';
import MapPanel from './components/MapPanel';
import FishingAnalysis from './components/FishingAnalysis';
import WeatherCard from './components/WeatherCard';
import ShareButton from './components/ShareButton';
import ForecastCard from './components/ForecastCard';
import WeatherDetail from './components/WeatherDetail';
import UserCenter from './components/UserCenter';
import BottomNav from './components/BottomNav';
import { getNowWeather, get7DayForecast, convertQWeatherToAppFormat } from './utils/qweatherApi';
import 'leaflet/dist/leaflet.css';

// 和风天气 API 直接提供中文天气描述，不需要转换函数

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fishingRecommendation, setFishingRecommendation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('search');
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'map', 'profile'
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [mapCenter] = useState([30.5928, 114.3055]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const shareContentRef = useRef(null);

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

  // 页面加载时自动获取用户位置
  useEffect(() => {
    fetchWeatherByLocation();
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
    
    if (savedLocations.some(loc => loc.name === city.trim())) {
      setError('该地点已在常用钓点中');
      setSuccessMessage('');
      return;
    }
    
    saveLocation(city);
    setError('');
    setSuccessMessage(`已添加「${city.trim()}」到常用钓点`);
    
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

    // 温度评分
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

    // 风速评分
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

    // 气压评分
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

    return { score, recommendation, level, color, reasons, tips };
  };

  // 获取城市坐标
  const getCityCoordinates = async (cityName) => {
    try {
      const amapKey = import.meta.env.VITE_AMAP_KEY;
      
      if (!amapKey || amapKey === 'your_amap_key_here') {
        console.error('高德地图 Key 未配置或使用默认值');
        throw new Error('高德地图 API Key 未正确配置，请检查环境变量 VITE_AMAP_KEY');
      }
      
      const response = await axios.get(
        `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(cityName)}&output=json&key=${amapKey}`
      );
      
      if (response.data.geocodes && response.data.geocodes.length > 0) {
        const location = response.data.geocodes[0].location.split(',');
        return {
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1]),
          name: response.data.geocodes[0].formatted_address
        };
      }
      
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

  // 获取天气数据
  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('请输入城市名称');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const coords = await getCityCoordinates(cityName);
      
      // 使用和风天气 API
      const [nowData, forecastData] = await Promise.all([
        getNowWeather(coords.latitude, coords.longitude),
        get7DayForecast(coords.latitude, coords.longitude)
      ]);
      
      // 转换为应用格式
      const { weatherData, forecastDays } = convertQWeatherToAppFormat(
        nowData, 
        forecastData, 
        cityName
      );
      
      setWeather(weatherData);
      setForecast(forecastDays);
      const analysis = analyzeFishingConditions(weatherData);
      setFishingRecommendation(analysis);
    } catch (err) {
      setError('获取天气信息失败，请检查城市名称或稍后再试');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 根据经纬度获取天气
  const fetchWeatherByCoordinates = async (latitude, longitude) => {
    setLoading(true);
    setError('');
    
    try {
      // 获取地点名称 - 优先使用高德地图
      let cityName = `位置 (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
      try {
        // 使用高德地图逆地理编码（国内访问稳定）
        const amapKey = import.meta.env.VITE_AMAP_KEY;
        
        if (!amapKey || amapKey === 'your_amap_key_here') {
          console.warn('高德地图 Key 未配置，跳过逆地理编码');
          // 继续使用默认地名（坐标）
        } else {
          const amapResponse = await axios.get(
            `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&output=json&key=${amapKey}`
          );
        
          if (amapResponse.data.status === '1' && amapResponse.data.regeocode) {
            const addressComponent = amapResponse.data.regeocode.addressComponent;
            const parts = [];
            
            // 构建地址：市/区/街道/社区
            if (addressComponent.city) {
              parts.push(addressComponent.city);
            } else if (addressComponent.province) {
              parts.push(addressComponent.province);
            }
            
            if (addressComponent.district && addressComponent.district !== addressComponent.city) {
              parts.push(addressComponent.district);
            }
            
            if (addressComponent.township) {
              parts.push(addressComponent.township);
            }
            
            if (parts.length > 0) {
              cityName = parts.join('');
            } else {
              cityName = amapResponse.data.regeocode.formatted_address || cityName;
            }
          }
        }
      } catch (geoErr) {
        console.warn('高德地图逆地理编码失败，使用默认地名:', geoErr);
        // 高德失败时不再尝试 Nominatim，直接使用坐标作为地名
      }
      
      // 使用和风天气 API
      const [nowData, forecastData] = await Promise.all([
        getNowWeather(latitude, longitude),
        get7DayForecast(latitude, longitude)
      ]);
      
      // 转换为应用格式
      const { weatherData, forecastDays } = convertQWeatherToAppFormat(
        nowData, 
        forecastData, 
        cityName
      );
      
      setWeather(weatherData);
      setCity(cityName);
      setForecast(forecastDays);
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
          const { latitude, longitude } = position.coords;
          await fetchWeatherByCoordinates(latitude, longitude);
        },
        () => {
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

  // 生成分享图片
  const generateShareImage = async () => {
    if (!shareContentRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      const canvas = await html2canvas(shareContentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `钓鱼天气-${weather?.name || '分析'}-${new Date().toLocaleDateString('zh-CN')}.png`;
      link.click();
      
      setSuccessMessage('图片已生成并下载！');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('生成图片失败:', err);
      setError('生成图片失败，请重试');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSavedLocationSelect = (locationName) => {
    setCity(locationName);
    fetchWeather(locationName);
    setViewMode('search');
    setCurrentPage('home');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDayClick = (day) => {
    setSelectedDayDetail(day);
  };

  const handleCloseDayDetail = () => {
    setSelectedDayDetail(null);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex flex-col overflow-hidden">
      {/* Fixed Header - 仅在个人中心页面隐藏 */}
      {currentPage !== 'profile' && (
      <div className="flex-shrink-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-md mx-auto px-4 pt-4 pb-3">
          <div className="text-center text-white">
            <div className="flex items-center justify-center">
              <Fish className="w-8 h-8 mr-2" />
              <h1 className="text-2xl font-bold">钓鱼天气</h1>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Content - Scrollable */}
      <div 
        className="flex-1 overflow-y-scroll pb-20"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
      {currentPage === 'profile' ? (
        <UserCenter
          locations={savedLocations}
          onSelect={handleSavedLocationSelect}
          onRemove={removeLocation}
          onClose={() => setCurrentPage('home')}
        />
      ) : currentPage === 'map' ? (
        <div className="h-full relative">
          {/* Full Screen Map */}
          <div className="absolute inset-0">
            <MapSelector
              onLocationSelect={handleMapLocationSelect}
              selectedLocation={selectedMapLocation}
              center={mapCenter}
              zoom={11}
              fullScreen={true}
            />
          </div>
          
          {/* Floating Info Panel */}
          {selectedMapLocation && (
            <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-10 max-w-md mx-auto">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">已选位置：</span>
                纬度 {selectedMapLocation.lat.toFixed(4)}°, 
                经度 {selectedMapLocation.lng.toFixed(4)}°
              </p>
            </div>
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 z-10">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">正在获取天气数据...</span>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="absolute top-20 left-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-lg p-3 z-10 max-w-md mx-auto">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Floating Weather Results */}
          {weather && fishingRecommendation && (
            <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto z-10 pointer-events-auto">
              <div 
                className="max-h-[60vh] overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="space-y-3 pb-2">
                  {/* 7日预报 - 优先显示 */}
                  <ForecastCard 
                    forecast={forecast} 
                    onDayClick={handleDayClick}
                  />
                  <FishingAnalysis recommendation={fishingRecommendation} />
                  <WeatherCard weather={weather} />
                  <button
                    onClick={addCurrentToSaved}
                    className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm text-yellow-700 py-3 rounded-xl hover:bg-yellow-50 transition-colors border border-yellow-200 shadow-lg active:scale-95"
                  >
                    <Star className="w-5 h-5" />
                    <span className="font-medium">收藏当前钓点</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Search Panel */}
        <SearchPanel
          city={city}
          setCity={setCity}
          loading={loading}
          error={error}
          successMessage={successMessage}
          onSubmit={handleSubmit}
          onUseLocation={fetchWeatherByLocation}
          onAddToSaved={addCurrentToSaved}
          showAddButton={!!weather}
        />

        {/* Weather Results */}
        {weather && fishingRecommendation && (
          <div className="space-y-4">
            {/* 5日预报 - 优先显示 */}
            <ForecastCard 
              forecast={forecast} 
              onDayClick={handleDayClick}
            />
            
            {/* 当前天气详情 */}
            <div ref={shareContentRef} className="space-y-4">
              <FishingAnalysis recommendation={fishingRecommendation} />
              <WeatherCard weather={weather} />
            </div>
          </div>
        )}

        {/* Share Button */}
        {weather && fishingRecommendation && (
          <ShareButton
            onClick={generateShareImage}
            isGenerating={isGeneratingImage}
          />
        )}

        {/* Footer */}
        <div className="text-center text-white text-xs pt-4 pb-2 opacity-80">
          <p>数据仅供参考，实际情况请以现场为准</p>
          <p className="mt-1">Powered by Open-Meteo & OpenStreetMap</p>
        </div>
      </div>
      )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={currentPage} onTabChange={handlePageChange} />

      {/* Weather Detail Modal */}
      {selectedDayDetail && (
        <WeatherDetail
          day={selectedDayDetail}
          locationName={weather?.name || city}
          onClose={handleCloseDayDetail}
        />
      )}
    </div>
  );
}

export default App;
