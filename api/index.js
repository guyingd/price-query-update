const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// 读取数据文件
const productsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'products.json'), 'utf8')
);

// 搜索API
app.get('/api/search', (req, res) => {
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

// 其他API路由...

module.exports = app; 