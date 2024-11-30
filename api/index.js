const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// 读取数据文件
const productsData = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'products.json'), 'utf8'));
    } catch (error) {
        console.error('无法读取products.json:', error);
        throw new Error('无法加载数据文件');
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

module.exports = app; 