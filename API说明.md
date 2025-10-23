# 天气API使用说明

## 当前使用的API

### 1. Open-Meteo 天气API

**官网**: https://open-meteo.com/

**特点**:
- ✅ 完全免费
- ✅ 无需注册和API key
- ✅ 无请求次数限制
- ✅ 数据准确可靠
- ✅ 支持全球范围

**API端点**:
```
https://api.open-meteo.com/v1/forecast
```

**请求参数**:
- `latitude`: 纬度
- `longitude`: 经度
- `current`: 当前天气参数（温度、湿度、风速、气压等）
- `timezone`: 时区

**示例请求**:
```
https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&timezone=Asia/Shanghai
```

**返回数据**:
```json
{
  "current": {
    "temperature_2m": 20.5,
    "relative_humidity_2m": 65,
    "apparent_temperature": 19.8,
    "precipitation": 0,
    "weather_code": 0,
    "surface_pressure": 1013.2,
    "wind_speed_10m": 3.5
  }
}
```

### 2. OpenStreetMap Nominatim 地理编码API

**官网**: https://nominatim.openstreetmap.org/

**特点**:
- ✅ 完全免费
- ✅ 开源项目
- ✅ 支持正向和反向地理编码
- ⚠️ 建议请求间隔 >1秒

**正向地理编码（城市名 → 坐标）**:
```
https://nominatim.openstreetmap.org/search?q=北京,中国&format=json&limit=1&accept-language=zh-CN
```

**反向地理编码（坐标 → 城市名）**:
```
https://nominatim.openstreetmap.org/reverse?lat=39.9&lon=116.4&format=json&accept-language=zh-CN
```

## WMO天气代码对照表

Open-Meteo使用WMO（世界气象组织）标准天气代码：

| 代码 | 描述 | 分类 |
|------|------|------|
| 0 | 晴朗 | Clear |
| 1 | 基本晴朗 | Clouds |
| 2 | 部分多云 | Clouds |
| 3 | 阴天 | Clouds |
| 45, 48 | 有雾 | Clouds |
| 51-57 | 毛毛雨 | Rain |
| 61-67 | 雨 | Rain |
| 71-77 | 雪 | Snow |
| 80-82 | 阵雨 | Rain |
| 85-86 | 阵雪 | Snow |
| 95-99 | 雷暴 | Thunderstorm |

## 为什么更换API？

### 之前使用：OpenWeatherMap
**问题**:
- ❌ 需要注册和API key
- ❌ 免费版有请求限制（60次/分钟）
- ❌ API key可能过期或被限制
- ❌ 配置复杂

### 现在使用：Open-Meteo
**优势**:
- ✅ 无需任何配置
- ✅ 开箱即用
- ✅ 更适合个人项目和学习
- ✅ 数据同样准确可靠
- ✅ 响应速度快

## 使用建议

1. **合理使用**
   - Nominatim建议请求间隔 >1秒
   - 可以考虑添加请求缓存
   - 避免短时间内大量请求

2. **错误处理**
   - 已实现完善的错误处理机制
   - 地理编码失败时有备用方案
   - 用户友好的错误提示

3. **优化方向**
   - 可以添加本地缓存（localStorage）
   - 常用城市坐标预设
   - 添加请求节流（throttle）

## 其他可选的免费天气API

如果需要更换，还可以考虑：

1. **和风天气（QWeather）**
   - 国内服务，速度快
   - 免费版每天1000次请求
   - 需要注册API key
   - 官网：https://www.qweather.com/

2. **心知天气**
   - 免费版每天400次请求
   - 需要注册API key
   - 官网：https://www.seniverse.com/

3. **WeatherAPI**
   - 免费版每天1000次请求
   - 需要注册API key
   - 官网：https://www.weatherapi.com/

## 技术实现细节

### 数据流程
1. 用户输入城市名称或使用定位
2. 通过Nominatim获取城市坐标
3. 使用坐标从Open-Meteo获取天气数据
4. 转换WMO天气代码为中文描述
5. 分析天气数据计算钓鱼指数
6. 展示结果和建议

### 数据转换
应用将Open-Meteo的数据格式转换为统一的内部格式，确保钓鱼指数算法可以正常工作：

```javascript
const weatherData = {
  name: cityName,
  main: {
    temp: temperature_2m,
    feels_like: apparent_temperature,
    humidity: relative_humidity_2m,
    pressure: surface_pressure
  },
  wind: {
    speed: wind_speed_10m
  },
  weather: [{
    main: getWeatherCondition(weather_code),
    description: getWeatherDescription(weather_code)
  }]
};
```

这样可以保持钓鱼指数算法的逻辑不变，只需要更换数据源即可。
