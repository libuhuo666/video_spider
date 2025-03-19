// ==UserScript==
// @name         视频解析去广告脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动移除视频解析接口中的各种广告
// @author       libuhuo666
// @match        https://*.m3u8.tv/*
// @match        https://*.jsonplayer.com/*
// @match        https://*.aidouer.net/*
// @match        https://*.bozrc.com/*
// @match        https://*.ckmov.vip/*
// @match        https://*.8090g.cn/*
// @match        https://*.playm3u8.cn/*
// @match        https://*.jiexi.la/*
// @match        https://*.playerjy.com/*
// @match        https://*.quanmingjiexi.com/*
// @match        https://*.libuhuo666.github.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 广告拦截CSS样式
    const adBlockCSS = `
        .ad, .ads, .advertisement, [class*="ad-"], [id*="ad-"],
        iframe[src*="ad"], div[data-ad], 
        .float, .popup, .modal,
        [style*="position:fixed"], [style*="position: fixed"],
        [style*="z-index:999"], [style*="z-index: 999"],
        .float-bottom, [class*="float"], [class*="popup"], [class*="banner"],
        [style*="bottom:0"], [style*="bottom: 0"],
        [style*="top:0"][style*="position:fixed"],
        iframe[src*="banner"], iframe[src*="google"], iframe[src*="cpa"], 
        iframe[src*="cpw"], iframe[style*="opacity:0"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
            max-height: 0 !important;
            max-width: 0 !important;
            overflow: hidden !important;
        }
    `;

    // 添加样式
    const styleEl = document.createElement('style');
    styleEl.textContent = adBlockCSS;
    document.head.appendChild(styleEl);
    
    // 广告选择器列表
    const adSelectors = [
        '.ad', '.ads', '.advertisement', 
        '[class*="ad-"]', '[id*="ad-"]',
        'iframe[src*="ad"]', 'div[data-ad]',
        '.float', '.popup', '.modal',
        'div[style*="z-index:"][style*="position: fixed"]',
        'div[style*="position: fixed"]',
        'div[style*="bottom:0"]',
        'iframe:not([src*="player"])',
        '[class*="float"]', '[class*="popup"]', '[class*="banner"]'
    ];
    
    // 立即执行一次广告移除
    removeAds();
    
    // 设置定时器持续检查和移除广告
    setInterval(removeAds, 1000);
    
    // 创建观察器，监控DOM变化
    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 移除广告函数
    function removeAds() {
        // 移除匹配选择器的元素
        adSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            } catch (e) {
                // 忽略错误
            }
        });
        
        // 清除可能的弹窗定时器
        for (let i = 0; i < 1000; i++) {
            clearInterval(i);
            clearTimeout(i);
        }
        
        // 移除所有内联事件处理程序
        document.querySelectorAll('*').forEach(el => {
            const attributes = el.getAttributeNames();
            attributes.forEach(attr => {
                if (attr.startsWith('on')) {
                    el.removeAttribute(attr);
                }
            });
        });
    }
    
    // 添加信息提示
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:5px 10px;border-radius:3px;font-size:12px;z-index:9999;opacity:0.8;';
    infoDiv.textContent = '广告过滤器已启用';
    document.body.appendChild(infoDiv);
    
    // 3秒后隐藏提示
    setTimeout(() => {
        infoDiv.style.opacity = '0';
        setTimeout(() => infoDiv.remove(), 500);
    }, 3000);
})(); 