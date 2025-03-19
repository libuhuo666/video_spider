# 视频解析代理服务器

这是一个专门为视频解析器项目开发的代理服务器，主要功能是移除第三方解析接口中的广告。

## 功能特点

- 代理第三方视频解析接口，自动移除广告
- 缓存解析结果，提高响应速度
- 自动过滤广告和跟踪脚本
- 提供纯净的播放页面
- 支持请求频率限制，防止滥用

## 部署方法

### 方法一：使用Render.com部署（推荐）

1. 注册[Render.com](https://render.com/)账号
2. 点击"New +"按钮，选择"Web Service"
3. 选择"Build and deploy from a Git repository"
4. 授权GitHub并选择您的仓库
5. 配置如下：
   - Name: video-proxy-server (或任意名称)
   - Root Directory: server
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. 点击"Create Web Service"

部署完成后，您会获得一个类似`https://your-app-name.onrender.com`的URL。

### 方法二：使用Railway.app部署

1. 注册[Railway.app](https://railway.app/)账号
2. 创建新项目，选择GitHub部署
3. 选择您的仓库
4. 添加变量：ROOT_DIR=server
5. 部署自动开始

### 方法三：使用云服务器部署

如果您有自己的服务器：

```bash
# 安装Node.js（如果尚未安装）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆代码
git clone https://github.com/libuhuo666/video_spider.git
cd video_spider/server

# 安装依赖
npm install

# 安装PM2进程管理器
npm install -g pm2

# 启动服务
pm2 start server.js

# 设置开机自启
pm2 startup
pm2 save
```

## 配置前端使用代理服务器

部署完成后，您需要修改`index.html`文件中的代理服务器URL：

```javascript
// 将这一行
const PROXY_SERVER = 'https://your-proxy-server-url.com';

// 修改为您实际部署的URL
const PROXY_SERVER = 'https://your-app-name.onrender.com';
```

## 注意事项

1. 免费的Render.com和Railway.app有使用限制，可能不适合高流量场景
2. 如果您的项目有大量访问，建议使用自己的服务器部署
3. 服务器端口可通过环境变量PORT设置，默认为3000 