# 和风天气 API 集成说明

## 概述

应用已集成和风天气 API，相比 Open-Meteo API 具有以下优势：
- ✅ 国内访问更快更稳定
- ✅ 数据更准确，更新更及时
- ✅ 提供更多天气数据（如日出日落、月相等）
- ✅ 支持中文本地化

## 配置步骤

### 1. 注册和风天气账号

访问 [和风天气开发平台](https://console.qweather.com/#/register) 注册账号。

### 2. 创建项目并获取 Project ID

1. 登录后进入控制台
2. 创建新项目
3. 选择 **Web API** 类型
4. 记录项目的 **Project ID**（在项目详情页）

### 3. 配置环境变量

创建 `.env` 文件（或修改现有文件）：

```env
QWEATHER_PROJECT_ID=your_project_id_here
QWEATHER_API_HOST=https://devapi.qweather.com
```

将 `your_project_id_here` 替换为你的实际 Project ID。

### 4. 部署到 Netlify

项目已经包含了 Netlify Function (`netlify/functions/qweather-proxy.js`)，它会：
- 使用你的 JWT 私钥生成认证 Token
- 代理请求到和风天气 API
- 处理 CORS 跨域问题

部署时，Netlify 会自动部署这个 Function。

**重要**: 确保项目根目录下有 `ed25519-private.pem` 文件（已包含）。

### 5. 在 Netlify 配置环境变量

1. 进入 Netlify 项目设置
2. 找到 **Environment variables**
3. 添加以下变量：
   - `QWEATHER_PROJECT_ID`: 你的 Project ID
   - `QWEATHER_API_HOST`: `https://devapi.qweather.com`

### 6. 重新部署

```bash
npm run build
netlify deploy --prod
```

## API 限额

和风天气免费版限额：
- **每天**: 1,000 次请求
- **每分钟**: 无限制（但建议合理控制）

对于个人使用完全足够。如需更多配额，可以升级到付费版。

## 技术实现

### 认证方式

应用使用 JWT (JSON Web Token) 认证，基于 Ed25519 算法：
- 私钥存储在服务器端 (`ed25519-private.pem`)
- Netlify Function 动态生成 Token
- Token 有效期：2小时

### API 端点

- **实时天气**: `/v7/weather/now`
- **7日预报**: `/v7/weather/7d`

### 数据转换

`src/utils/qweatherApi.js` 提供了数据转换函数，将和风天气的数据格式转换为应用内部使用的格式。

## 故障排查

### 1. 获取天气数据失败

检查：
- Netlify 环境变量是否正确配置
- Project ID 是否有效
- 是否超出 API 限额

### 2. JWT 认证失败

检查：
- `ed25519-private.pem` 文件是否存在
- 文件权限是否正确

### 3. 本地开发测试

本地测试需要启动 Netlify Dev：

```bash
npm install -g netlify-cli
netlify dev
```

这会在本地启动 Netlify Function，监听 `localhost:8888`。

## 切换回 Open-Meteo

如果需要切回 Open-Meteo API（免费，无需注册）：
1. 在 `App.jsx` 中注释掉和风天气相关导入
2. 恢复原来的 Open-Meteo API 调用逻辑

## 参考资料

- [和风天气开发文档](https://dev.qweather.com/docs/)
- [每日天气预报 API](https://dev.qweather.com/docs/api/weather/weather-daily-forecast/)
- [实时天气 API](https://dev.qweather.com/docs/api/weather/weather-now/)
- [JWT 认证说明](https://dev.qweather.com/docs/authentication/jwt/)
