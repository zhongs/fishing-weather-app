import { 
  X, 
  ThermometerSun, 
  Wind, 
  Droplets, 
  Fish,
  AlertCircle
} from 'lucide-react';
import { getQWeatherIcon } from '../utils/qweatherIcons.jsx';

const analyzeDayDetail = (day) => {
  const avgTemp = day.temp;
  const windSpeed = day.windSpeed;
  const precipitation = day.precipitation;
  
  let score = 100;
  let reasons = [];
  let tips = [];
  
  // 温度分析
  if (avgTemp < 5 || avgTemp > 35) {
    score -= 30;
    reasons.push('温度过于极端');
    tips.push('鱼类活动减少，建议选择其他时间');
  } else if (avgTemp < 10 || avgTemp > 30) {
    score -= 15;
    reasons.push('温度不够理想');
  } else if (avgTemp >= 15 && avgTemp <= 25) {
    tips.push('温度适宜，鱼类活跃');
  }
  
  // 风速分析
  if (windSpeed > 10) {
    score -= 30;
    reasons.push('风力过大');
    tips.push('大风影响抛竿，注意安全');
  } else if (windSpeed > 7) {
    score -= 15;
    reasons.push('风力较大');
  } else if (windSpeed >= 2 && windSpeed <= 5) {
    tips.push('微风拂面，氧气充足');
  } else if (windSpeed < 2) {
    tips.push('风力较小，可能需要打窝');
  }
  
  // 降水分析
  if (precipitation > 10) {
    score -= 20;
    reasons.push('降水量较大');
    tips.push('大雨天气影响出钓');
  } else if (precipitation > 5) {
    score -= 10;
    reasons.push('有降水');
  } else if (precipitation > 0 && precipitation <= 5) {
    score += 5;
    tips.push('小雨天气鱼类觅食活跃');
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

function WeatherDetail({ day, locationName, onClose }) {
  if (!day) return null;
  
  const analysis = analyzeDayDetail(day);
  const date = new Date(day.date);
  const dateStr = date.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white px-6 py-6 shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center gap-2 mb-1">
              <Fish className="w-5 h-5" />
              <h2 className="text-lg font-semibold">{locationName}</h2>
            </div>
            <p className="text-sm text-blue-50/90 font-medium">{dateStr}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-6 space-y-5">
            {/* Weather Icon and Description */}
            <div className="text-center -mt-2">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-3 shadow-inner">
                <div className="text-blue-500">
                  {getQWeatherIcon(day.weatherCode, 'w-16 h-16')}
                </div>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {day.text || '天气'}
              </p>
            </div>

            {/* Fishing Recommendation - Redesigned */}
            <div className={`${analysis.color} text-white rounded-2xl p-5 shadow-lg relative overflow-hidden`}>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Fish className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{analysis.recommendation}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium opacity-90">钓鱼指数</span>
                        <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                          {analysis.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black leading-none">{analysis.score}</div>
                    <div className="text-xs font-medium opacity-80 mt-0.5">分</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Weather Details - Redesigned */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              <div className="relative">
                <div className="flex items-center gap-2 text-orange-600 mb-3">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <ThermometerSun className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">温度</span>
                </div>
                <p className="text-3xl font-black text-gray-800 mb-1">{day.temp}<span className="text-xl">°</span></p>
                <p className="text-xs text-gray-600 font-medium">
                  <span className="text-red-500">↑ {day.tempMax}°</span>
                  <span className="mx-1.5">·</span>
                  <span className="text-blue-500">↓ {day.tempMin}°</span>
                </p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              <div className="relative">
                <div className="flex items-center gap-2 text-blue-600 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Wind className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">风速</span>
                </div>
                <p className="text-3xl font-black text-gray-800 mb-1">{day.windSpeed.toFixed(1)}<span className="text-sm ml-0.5">m/s</span></p>
                <p className="text-xs text-gray-600 font-medium">
                  {day.windSpeed < 2 ? '🍃 微风' : day.windSpeed < 5 ? '🌬️ 轻风' : day.windSpeed < 8 ? '💨 和风' : '🌪️ 强风'}
                </p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100 p-4 rounded-2xl border border-cyan-100 shadow-sm col-span-2 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-200/30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-600 mb-3">
                    <div className="p-1.5 bg-cyan-100 rounded-lg">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">降水量</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-800">{day.precipitation.toFixed(1)}<span className="text-sm ml-0.5">mm</span></p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium -mt-2">
                  {day.precipitation === 0 ? '☀️ 无降水' : day.precipitation < 5 ? '🌧️ 小雨' : day.precipitation < 10 ? '🌧️ 中雨' : '⛈️ 大雨'}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Details - Redesigned */}
          {analysis.reasons.length > 0 && (
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-2xl p-5 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-orange-500 text-white rounded-xl shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">不利因素</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 bg-white/60 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="w-5 h-5 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">{index + 1}</span>
                      <span className="flex-1 font-medium">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {analysis.tips.length > 0 && (
            <div className="relative bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 rounded-2xl p-5 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-300/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-green-500 text-white rounded-xl shadow-sm">
                    <Fish className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">提示建议</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 bg-white/60 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                      <span className="flex-1 font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gradient-to-t from-gray-50 to-white px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>关闭详情</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WeatherDetail;
