const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// 读取数据文件
const productsData = (() => {
    try {
        const filePath = process.env.VERCEL 
            ? path.join(__dirname, '../products.json')  // Vercel 环境
            : path.join(process.cwd(), 'products.json');  // 本地环境
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error('无法读取products.json:', error);
        return {}; // 返回空对象而不是抛出错误
    }
})();

// 搜索API
app.get('/api/search', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const keyword = req.query.keyword;
    if (!keyword) {
        const results = Object.keys(productsData).map(category => ({
            category,
            products: productsData[category]
        }));
        return res.json(results);
    }
    
    const results = [];
    for (const category in productsData) {
        const products = productsData[category];
        const matchedProducts = products.filter(product => 
            product.name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (matchedProducts.length > 0) {
            results.push({
                category,
                products: matchedProducts
            });
        }
    }
    
    res.json(results);
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const categories = Object.keys(productsData).map(category => ({
        category,
        products: productsData[category]
    }));
    res.json(categories);
});

// 处理 OPTIONS 请求
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app; 