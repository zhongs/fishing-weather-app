import { 
  Cloud, 
  CloudRain, 
  ThermometerSun, 
  Wind, 
  Droplets,
  Sun,
  CloudSnow
} from 'lucide-react';

const getWeatherIcon = (condition) => {
  const main = condition?.toLowerCase() || '';
  if (main.includes('rain')) return <CloudRain className="w-12 h-12" />;
  if (main.includes('cloud')) return <Cloud className="w-12 h-12" />;
  if (main.includes('clear')) return <Sun className="w-12 h-12" />;
  if (main.includes('snow')) return <CloudSnow className="w-12 h-12" />;
  return <Cloud className="w-12 h-12" />;
};

function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{weather.name}</h2>
            <p className="text-gray-600 capitalize text-sm">{weather.weather[0].description}</p>
          </div>
          <div className="text-blue-500 ml-3 flex-shrink-0">
            {getWeatherIcon(weather.weather[0].main)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-orange-600 mb-1.5">
              <ThermometerSun className="w-4 h-4" />
              <span className="text-xs font-medium">温度</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{Math.round(weather.main.temp)}°C</p>
            <p className="text-xs text-gray-600 mt-0.5">
              体感 {Math.round(weather.main.feels_like)}°C
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 mb-1.5">
              <Wind className="w-4 h-4" />
              <span className="text-xs font-medium">风速</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weather.wind.speed} m/s</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {weather.wind.speed < 2 ? '微风' : weather.wind.speed < 5 ? '轻风' : weather.wind.speed < 8 ? '和风' : '强风'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-600 mb-1.5">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-medium">湿度</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weather.main.humidity}%</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600 mb-1.5">
              <Cloud className="w-4 h-4" />
              <span className="text-xs font-medium">气压</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weather.main.pressure}</p>
            <p className="text-xs text-gray-600 mt-0.5">hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
