import { Calendar, Cloud, CloudRain, Sun, CloudSnow, TrendingUp, TrendingDown } from 'lucide-react';

const getWeatherIcon = (code, size = 'w-8 h-8') => {
  if (code === 0) return <Sun className={size} />;
  if (code <= 3) return <Cloud className={size} />;
  if (code >= 51 && code <= 67) return <CloudRain className={size} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={size} />;
  if (code >= 80 && code <= 82) return <CloudRain className={size} />;
  if (code >= 85 && code <= 86) return <CloudSnow className={size} />;
  return <Cloud className={size} />;
};

const analyzeForecastDay = (day) => {
  let score = 100;
  const avgTemp = day.temp;
  const windSpeed = day.windSpeed;
  
  // 温度评分
  if (avgTemp < 5 || avgTemp > 35) score -= 30;
  else if (avgTemp < 10 || avgTemp > 30) score -= 15;
  
  // 风速评分
  if (windSpeed > 10) score -= 30;
  else if (windSpeed > 7) score -= 15;
  
  // 降水评分
  if (day.precipitation > 10) score -= 20;
  else if (day.precipitation > 5) score -= 10;
  
  score = Math.max(0, Math.min(100, score));
  
  let level = '';
  let color = '';
  
  if (score >= 80) {
    level = '优秀';
    color = 'text-green-600 bg-green-50';
  } else if (score >= 60) {
    level = '良好';
    color = 'text-blue-600 bg-blue-50';
  } else if (score >= 40) {
    level = '一般';
    color = 'text-yellow-600 bg-yellow-50';
  } else {
    level = '较差';
    color = 'text-orange-600 bg-orange-50';
  }
  
  return { score, level, color };
};

function ForecastCard({ forecast, onDayClick }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-800">未来7天预报</h3>
          <span className="text-xs text-gray-500 ml-auto">点击查看详情</span>
        </div>
        
        <div className="space-y-2">
          {forecast.map((day, index) => {
            const analysis = analyzeForecastDay(day);
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
            
            return (
              <div
                key={index}
                onClick={() => onDayClick && onDayClick(day)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98] hover:shadow-md"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-blue-500 flex-shrink-0">
                    {getWeatherIcon(day.weatherCode, 'w-7 h-7')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">
                      {dayName} {monthDay}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        {day.tempMax}°
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3 text-blue-500" />
                        {day.tempMin}°
                      </span>
                      <span>💨 {day.windSpeed}m/s</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${analysis.color}`}>
                    {analysis.level}
                  </span>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">
                    {analysis.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ForecastCard;
