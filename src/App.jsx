import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Fish, Search, Map as MapIcon, Star, X } from 'lucide-react';
import MapSelector from './MapSelector';
import SearchPanel from './components/SearchPanel';
import MapPanel from './components/MapPanel';
import FishingAnalysis from './components/FishingAnalysis';
import WeatherCard from './components/WeatherCard';
import ShareButton from './components/ShareButton';
import ForecastCard from './components/ForecastCard';
import UserCenter from './components/UserCenter';
import BottomNav from './components/BottomNav';
import { getNowWeather, get7DayForecast, convertQWeatherToAppFormat } from './utils/qweatherApi';
import 'leaflet/dist/leaflet.css';

// 和风天气 API 直接提供中文天气描述，不需要转换函数

// VConsole调试工具初始化
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug') || urlParams.has('vconsole')) {
    import('vconsole').then(({ default: VConsole }) => {
      new VConsole();
      console.log('VConsole已启动 - 移动端调试工具');
    });
  }
}

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
  const [showMapWeather, setShowMapWeather] = useState(true);
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

  // 科学的钓鱼条件分析算法
  const analyzeFishingConditions = (weatherData) => {
    if (!weatherData) return null;

    const temp = weatherData.main.temp;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    const weatherText = weatherData.weather[0].description || weatherData.weather[0].main;
    const pressure = weatherData.main.pressure;

    let score = 60; // 基础分60分
    let reasons = [];
    let tips = [];
    let positiveFactors = [];

    // 1. 温度评分（权重：25分）
    if (temp >= 15 && temp <= 25) {
      score += 25;
      positiveFactors.push('温度适宜');
      tips.push('🌡️ 水温适中，鱼类活跃度高');
    } else if (temp >= 10 && temp < 15) {
      score += 15;
      tips.push('🌡️ 温度偏低，鱼口可能较慢');
    } else if (temp > 25 && temp <= 30) {
      score += 10;
      tips.push('🌡️ 温度偏高，建议选择深水区或树荫下');
    } else if (temp < 10) {
      score -= 15;
      reasons.push('温度过低');
      tips.push('❄️ 冬季钓鱼，选择向阳深水区，用腥饵');
    } else if (temp > 30) {
      score -= 20;
      reasons.push('温度过高');
      tips.push('🔥 高温天气，早晚时段更适合');
    }

    // 2. 气压评分（权重：20分，非常关键）
    if (pressure >= 1005 && pressure <= 1020) {
      score += 20;
      positiveFactors.push('气压稳定');
      tips.push('📊 气压适中，鱼儿开口好');
    } else if (pressure > 1020) {
      score += 10;
      tips.push('📊 高气压，鱼可能在水底，建议钓底');
    } else if (pressure >= 995 && pressure < 1005) {
      score -= 5;
      tips.push('📊 气压偏低，鱼口一般');
    } else {
      score -= 15;
      reasons.push('气压异常');
      tips.push('⚠️ 气压变化大，鱼不爱咬钩');
    }

    // 3. 风力评分（权重：15分）
    if (windSpeed >= 0.5 && windSpeed <= 2) {
      score += 15;
      positiveFactors.push('微风');
      tips.push('🍃 微风增加水中溶氧，鱼活跃');
    } else if (windSpeed > 2 && windSpeed <= 4) {
      score += 10;
      tips.push('💨 风力适中，可选择下风口作钓');
    } else if (windSpeed > 4 && windSpeed <= 6) {
      score -= 5;
      tips.push('💨 风力较大，注意抛竿准确性');
    } else if (windSpeed > 6) {
      score -= 20;
      reasons.push('风力过大');
      tips.push('🌪️ 大风天气，影响抛竿和观漂');
    } else {
      score += 5;
      tips.push('🎣 无风天气，浮漂信号清晰');
    }

    // 4. 天气现象评分（权重：20分）
    const weatherLower = weatherText.toLowerCase();
    if (weatherLower.includes('小雨') || weatherLower.includes('light rain') || weatherLower.includes('毛毛雨')) {
      score += 20;
      positiveFactors.push('小雨天');
      tips.push('🌧️ 小雨增加溶氧，鱼觅食积极，绝佳时机！');
    } else if (weatherLower.includes('阴') || weatherLower.includes('cloudy') || weatherLower.includes('overcast')) {
      score += 15;
      positiveFactors.push('阴天');
      tips.push('☁️ 阴天光线柔和，鱼胆子大，更易咬钩');
    } else if (weatherLower.includes('多云') || weatherLower.includes('partly cloudy')) {
      score += 10;
      positiveFactors.push('多云');
      tips.push('⛅ 云层遮挡部分阳光，较适合作钓');
    } else if (weatherLower.includes('晴') || weatherLower.includes('clear') || weatherLower.includes('sunny')) {
      score += 0;
      tips.push('☀️ 晴天光线强，建议选择浑水或背阴处');
    } else if (weatherLower.includes('中雨') || weatherLower.includes('moderate rain')) {
      score -= 10;
      reasons.push('中雨');
      tips.push('🌧️ 中雨影响视线，可在雨停前后作钓');
    } else if (weatherLower.includes('大雨') || weatherLower.includes('heavy rain') || weatherLower.includes('暴雨')) {
      score -= 30;
      reasons.push('大雨/暴雨');
      tips.push('⛈️ 暴雨水浑鱼惊，建议雨后再来');
    } else if (weatherLower.includes('雷') || weatherLower.includes('thunder')) {
      score -= 50;
      reasons.push('雷电天气');
      tips.push('⚡ 危险！严禁钓鱼，注意人身安全！');
    } else if (weatherLower.includes('雪') || weatherLower.includes('snow')) {
      score -= 20;
      reasons.push('降雪天气');
      tips.push('❄️ 雪天温度低，鱼口差，不建议出钓');
    } else if (weatherLower.includes('雾') || weatherLower.includes('fog') || weatherLower.includes('霾')) {
      score -= 5;
      tips.push('🌫️ 能见度低，注意安全，影响观漂');
    }

    // 5. 湿度评分（权重：10分）
    if (humidity >= 70 && humidity <= 90) {
      score += 10;
      tips.push('💧 湿度适宜，舒适度高');
    } else if (humidity > 90) {
      score += 5;
      tips.push('💧 湿度很高，小雨前兆，鱼可能活跃');
    } else if (humidity < 50) {
      score -= 5;
      tips.push('🏜️ 湿度偏低，注意补水防晒');
    }

    // 6. 时段建议（不计分，仅提示）
    const hour = new Date().getHours();
    if ((hour >= 5 && hour <= 9) || (hour >= 16 && hour <= 19)) {
      tips.push('⏰ 当前是鱼类觅食高峰期，黄金时段！');
    } else if (hour >= 11 && hour <= 15) {
      tips.push('🕐 中午时段，可钓深水或阴凉处');
    }

    // 7. 综合建议
    if (positiveFactors.length >= 3) {
      tips.unshift('✨ 多项有利条件叠加，今天出钓成功率高！');
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
  const handleMapLocationSelect = async (location) => {
    setSelectedMapLocation(location);
    await fetchWeatherByCoordinates(location.lat, location.lng);
    // 获取天气后自动显示天气详情
    setShowMapWeather(true);
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
    // 切换到地图页面时重置天气显示状态
    if (page === 'map') {
      setShowMapWeather(true);
    }
  };

  const handleCloseMapWeather = () => {
    setShowMapWeather(false);
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
        className="flex-1 overflow-y-scroll pb-16"
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
          
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 z-10">
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
            <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-lg p-3 z-10 max-w-md mx-auto">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Map Weather Modal */}
          {weather && fishingRecommendation && showMapWeather && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={handleCloseMapWeather}
            >
              <div 
                className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white px-6 py-5 shadow-lg flex-shrink-0">
                  <button
                    onClick={handleCloseMapWeather}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95 border border-white/30"
                    aria-label="关闭"
                  >
                    <X className="w-6 h-6 stroke-[3]" />
                  </button>
                  
                  <div className="pr-12">
                    <div className="flex items-center gap-2 mb-1">
                      <Fish className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">{weather?.name || city}</h2>
                    </div>
                    {selectedMapLocation && (
                      <p className="text-sm text-blue-50/90">
                        {selectedMapLocation.lat.toFixed(4)}°, {selectedMapLocation.lng.toFixed(4)}°
                      </p>
                    )}
                  </div>
                </div>

                {/* Scrollable Content */}
                <div 
                  className="flex-1 overflow-y-auto overscroll-contain p-4"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="space-y-3">
                    <FishingAnalysis recommendation={fishingRecommendation} />
                    <WeatherCard weather={weather} />
                    <ForecastCard forecast={forecast} />
                    <button
                      onClick={addCurrentToSaved}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg active:scale-95"
                    >
                      <Star className="w-5 h-5" />
                      <span className="font-medium">收藏当前钓点</span>
                    </button>
                  </div>
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
            <ForecastCard forecast={forecast} />
            
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
      </div>
      )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={currentPage} onTabChange={handlePageChange} />
    </div>
  );
}

export default App;
