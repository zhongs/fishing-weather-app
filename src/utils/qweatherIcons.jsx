import React from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudDrizzle, CloudFog, Wind } from 'lucide-react';

/**
 * 根据和风天气图标代码返回对应的 Lucide 图标组件
 * @param {string} code - 和风天气图标代码
 * @param {string} size - 图标大小类名
 * @returns JSX Element
 */
export const getQWeatherIcon = (code, size = 'w-8 h-8') => {
  const iconCode = parseInt(code, 10);
  
  // 100: 晴
  if (iconCode === 100) return <Sun className={size} />;
  
  // 101-104: 多云
  if (iconCode >= 101 && iconCode <= 104) return <Cloud className={size} />;
  
  // 150-153: 晴（夜间）
  if (iconCode >= 150 && iconCode <= 154) return <Cloud className={size} />;
  
  // 300-399: 雨
  if (iconCode >= 300 && iconCode < 400) {
    // 毛毛雨
    if (iconCode >= 300 && iconCode <= 303) return <CloudDrizzle className={size} />;
    // 雨
    return <CloudRain className={size} />;
  }
  
  // 400-499: 雪
  if (iconCode >= 400 && iconCode < 500) return <CloudSnow className={size} />;
  
  // 500-515: 雾霾等
  if (iconCode >= 500 && iconCode <= 515) return <CloudFog className={size} />;
  
  // 800-899: 大风等
  if (iconCode >= 800 && iconCode < 900) return <Wind className={size} />;
  
  // 默认返回云
  return <Cloud className={size} />;
};

/**
 * 分析天气条件是否适合钓鱼（扩展版，支持和风天气数据）
 * @param {object} day - 天气数据
 * @returns {object} 分析结果
 */
export const analyzeFishingConditions = (day) => {
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
