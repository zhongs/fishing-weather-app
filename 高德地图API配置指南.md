# 高德地图 API 配置指南

## 1. 申请高德地图 API Key

### 步骤一：注册高德开放平台账号
访问 [高德开放平台](https://lbs.amap.com/) 并注册账号。

### 步骤二：创建应用
1. 登录后进入 [控制台](https://console.amap.com/)
2. 点击「应用管理」→「我的应用」
3. 点击「创建新应用」
4. 填写应用名称（如：钓鱼天气应用）

### 步骤三：添加 Key
1. 在创建的应用下，点击「添加」按钮
2. 服务平台选择：**Web服务**
3. 填写 Key 名称（如：钓鱼天气Web服务）
4. 提交后会生成一个 API Key

### 步骤四：配置白名单（可选）
- 在 Key 设置中可以配置 IP 白名单或域名白名单
- 开发阶段可以不配置，生产环境建议配置

## 2. 本地开发配置

### 创建 `.env` 文件
在项目根目录创建 `.env` 文件（已在 .gitignore 中，不会被提交）：

```bash
# 和风天气 API 配置
QWEATHER_PROJECT_ID=你的和风天气项目ID
QWEATHER_CREDENTIAL_ID=你的和风天气凭据ID
QWEATHER_API_HOST=https://devapi.qweather.com

# 高德地图 API 配置
VITE_AMAP_KEY=你的高德地图Key
```

### 更新本地 `.env` 文件
将申请到的高德地图 Key 填入 `VITE_AMAP_KEY`。

## 3. Netlify 生产环境配置

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 选择你的项目
3. 进入 **Site configuration** → **Environment variables**
4. 添加环境变量：
   - **变量名**：`VITE_AMAP_KEY`
   - **变量值**：你的高德地图 Key

## 4. 免费额度说明

高德地图 Web服务 API 免费额度：
- 每日配额：30万次
- QPS（每秒请求数）：无限制
- 一般个人项目完全够用

## 5. 常见问题

### Q: 为什么使用 VITE_ 前缀？
A: Vite 要求客户端可访问的环境变量必须以 `VITE_` 开头，否则不会被打包到前端代码中。

### Q: 如何验证 Key 是否配置成功？
A: 启动项目后，在地图选点或搜索城市时，打开浏览器控制台查看网络请求，确认高德地图 API 返回 `status: "1"` 表示成功。

### Q: Key 泄露了怎么办？
A: 在高德控制台删除旧 Key 并创建新的，然后更新环境变量配置。

## 6. API 使用说明

项目中使用了两个高德地图接口：

1. **地理编码**（地名→坐标）
   - 接口：`/v3/geocode/geo`
   - 用途：用户搜索城市名时获取经纬度

2. **逆地理编码**（坐标→地名）
   - 接口：`/v3/geocode/regeo`
   - 用途：地图选点或GPS定位时获取地点名称
