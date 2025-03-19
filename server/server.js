const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

// 缓存目录设置
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const app = express();
app.use(cors());

// 限制请求频率
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP限制请求数
  message: "请求太频繁，请稍后再试"
});

app.use('/proxy', limiter);

// 缓存时间（小时）
const CACHE_HOURS = 24;

// 黑名单网站
const BLACKLIST = [
  'malicious-site.com'
];

// 中间件：检查黑名单
app.use((req, res, next) => {
  const url = req.query.url;
  if (url && BLACKLIST.some(site => url.includes(site))) {
    return res.status(403).send('禁止访问该网站');
  }
  next();
});

// 普通代理模式 - 使用axios直接请求
app.get('/proxy', async (req, res) => {
  const videoUrl = req.query.url;
  const apiUrl = req.query.api;
  
  if (!videoUrl || !apiUrl) {
    return res.status(400).send('缺少必要参数');
  }

  const cacheFile = path.join(cacheDir, `${Buffer.from(videoUrl + apiUrl).toString('base64')}.html`);
  
  // 检查缓存
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const fileAge = (new Date() - stats.mtime) / (1000 * 60 * 60); // 小时
    
    if (fileAge < CACHE_HOURS) {
      console.log('从缓存提供内容');
      return res.sendFile(cacheFile);
    }
  }
  
  try {
    console.log(`代理请求: ${apiUrl}${encodeURIComponent(videoUrl)}`);
    
    const response = await axios.get(`${apiUrl}${encodeURIComponent(videoUrl)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': apiUrl
      }
    });
    
    // 使用cheerio清理内容
    const $ = cheerio.load(response.data);
    
    // 移除广告元素
    removeAds($);
    
    // 移除第三方统计和跟踪
    $('script[src*="cnzz"]').remove();
    $('script[src*="analytics"]').remove();
    $('script[src*="googletagmanager"]').remove();
    
    // 清理所有内联事件处理程序
    $('*').each((i, el) => {
      Object.keys(el.attribs || {}).forEach(attr => {
        if (attr.startsWith('on')) {
          $(el).removeAttr(attr);
        }
      });
    });
    
    const cleanHtml = $.html();
    
    // 保存到缓存
    fs.writeFileSync(cacheFile, cleanHtml);
    
    res.send(cleanHtml);
  } catch (error) {
    console.error('代理请求失败:', error.message);
    res.status(500).send(`解析失败: ${error.message}`);
  }
});

// 清理广告的函数
function removeAds($) {
  // 广告选择器
  const adSelectors = [
    '.ad', '.ads', '.advertisement', 
    '[class*="ad-"]', '[id*="ad-"]',
    'iframe[src*="ad"]', 'div[data-ad]',
    '.float', '.popup', '.modal',
    'div[style*="z-index:"][style*="position: fixed"]',
    'div[style*="position: fixed"]'
  ];
  
  adSelectors.forEach(selector => {
    $(selector).remove();
  });
  
  // 移除所有内联JS和事件处理程序
  $('script:not([src])').remove();
}

// 提供直接的播放页面
app.get('/play', (req, res) => {
  const videoUrl = req.query.url;
  const apiUrl = req.query.api;
  
  if (!videoUrl || !apiUrl) {
    return res.status(400).send('缺少必要参数');
  }
  
  const proxyUrl = `/proxy?url=${encodeURIComponent(videoUrl)}&api=${encodeURIComponent(apiUrl)}`;
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>纯净播放页面</title>
    <style>
      body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      .player { width: 100%; height: 100vh; border: none; }
    </style>
  </head>
  <body>
    <iframe class="player" src="${proxyUrl}" allowfullscreen></iframe>
  </body>
  </html>
  `;
  
  res.send(html);
});

// 服务器状态监控
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    cacheItems: fs.readdirSync(cacheDir).length,
    uptime: process.uptime()
  });
});

// 提供静态文件，使用静态中间件
app.use(express.static(path.join(__dirname, '../')));

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
}); 