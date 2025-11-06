# VConsole 移动端调试工具使用说明

## 📱 什么是 VConsole？

VConsole 是一个轻量级、可拓展、针对手机网页的前端开发者调试面板。可以在移动端查看：
- Console 日志
- Network 网络请求
- Element 元素信息
- Storage 本地存储
- System 系统信息

## 🚀 如何启用？

在访问应用时，在 URL 后添加以下任一参数即可启用：

### 方法1：使用 `debug` 参数
```
http://localhost:5173/?debug
```

### 方法2：使用 `vconsole` 参数
```
http://localhost:5173/?vconsole
```

## 💡 使用场景

### 本地开发
```
http://localhost:5173/?debug
```

### 线上调试
```
https://your-domain.netlify.app/?debug
```

### 配合其他参数使用
如果 URL 已有其他参数，使用 `&` 连接：
```
http://localhost:5173/?city=武汉&debug
```

## 🎯 使用方法

1. **打开应用** - 在 URL 后加上 `?debug` 或 `?vconsole`
2. **查看面板** - 页面右下角会出现绿色的 VConsole 按钮
3. **点击按钮** - 展开调试面板
4. **切换标签** - 点击顶部标签切换不同功能
   - **Log** - 查看 console 输出
   - **Network** - 查看网络请求
   - **Element** - 查看页面元素
   - **Storage** - 查看本地存储（savedLocations等）
   - **System** - 查看设备信息

## 🔧 调试技巧

### 查看API请求
1. 打开 Network 标签
2. 执行天气查询操作
3. 查看和风天气API的请求和响应

### 查看本地存储
1. 打开 Storage 标签
2. 找到 `fishingLocations` 查看收藏的钓点数据

### 查看错误日志
1. 打开 Log 标签
2. 查看红色的 error 信息
3. 点击展开查看详细堆栈

## 📝 注意事项

- VConsole 仅在添加参数时加载，不会影响正常使用性能
- 调试完成后可以移除 URL 参数，面板会自动消失
- 建议在移动设备或移动端模拟器中使用
- 生产环境也可以使用，方便用户反馈问题时收集信息

## 🔍 实际应用示例

### 调试天气查询问题
```
1. 打开 http://localhost:5173/?debug
2. 点击右下角 VConsole 按钮
3. 切换到 Network 标签
4. 在应用中搜索城市
5. 查看 API 请求是否成功
```

### 检查本地存储
```
1. 打开 http://localhost:5173/?debug
2. 点击 VConsole 按钮
3. 切换到 Storage 标签
4. 查看 localStorage 中的 fishingLocations
```

### 查看控制台输出
```
1. 打开 http://localhost:5173/?debug
2. 点击 VConsole 按钮
3. 切换到 Log 标签
4. 查看应用运行时的日志输出
```

## 🎉 快速测试

访问以下链接立即体验：
```
http://localhost:5173/?debug
```

绿色按钮会出现在页面右下角，点击即可使用！
