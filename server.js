const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// 确保数据目录存在
const dataDir = path.join(process.env.APPDATA || process.env.HOME, '.price-query');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// 定义数据文件路径
const dataFile = path.join(dataDir, 'products.json');
const versionFile = path.join(dataDir, 'version.txt');

// 数据版本控制
const DATA_VERSION = "1.0.4"; // 与软件版本保持一致

// 检查并更新数据
function checkAndUpdateData() {
    try {
        const needsUpdate = !fs.existsSync(dataFile) || 
            !fs.existsSync(versionFile) ||
            fs.readFileSync(versionFile, 'utf8') !== DATA_VERSION;
        
        if (needsUpdate) {
            console.log('检测到新版本，正在更新数据...');
            // 复制新的数据文件
            fs.copyFileSync(
                path.join(__dirname, 'products.json'),
                dataFile
            );
            // 更新版本信息
            fs.writeFileSync(versionFile, DATA_VERSION, 'utf8');
            // 重新加载数据
            Object.assign(productsData, JSON.parse(fs.readFileSync(dataFile, 'utf8')));
            console.log('数据更新完成');
        }
    } catch (error) {
        console.error('数据更新失败:', error);
    }
}

// 初始检查和更新
checkAndUpdateData();

console.log('数据文件位置:', dataFile);

// 延迟加载数据
let productsData = null;

function loadData() {
    if (!productsData) {
        productsData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
    return productsData;
}

// 在第一次请求时加载数据
app.use((req, res, next) => {
    if (!productsData) {
        loadData();
    }
    next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',  // 缓存静态文件1小时
    etag: true,
    lastModified: true
}));

// 管理页面路由
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 搜索API
app.get('/api/search', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    const keyword = req.query.keyword;
    if (!keyword) {
        // 如果没有关键词，返回所有分类
        const results = Object.keys(productsData).map(category => ({
            category,
            products: productsData[category]
        }));
        res.json(results);
        return;
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

// 关于页面路由
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'about.html'));
});

// 添加根路由处理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由
app.get('/api/categories', (req, res) => {
    const categories = Object.keys(productsData).map(category => ({
        category,
        products: productsData[category]
    }));
    res.json(categories);
});

// 添加新分类
app.post('/api/categories', express.json(), (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: '分类名称不能为空' });
    }
    if (productsData[name]) {
        return res.status(400).json({ error: '分类已存在' });
    }
    productsData[name] = [];
    saveData();
    res.json({ success: true });
});

// 修改分类名称
app.put('/api/categories/:category', express.json(), (req, res) => {
    const oldName = req.params.category;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: '分类名称不能为空' });
    }
    if (!productsData[oldName]) {
        return res.status(404).json({ error: '分类不存在' });
    }
    if (oldName !== name && productsData[name]) {
        return res.status(400).json({ error: '新分类名称已存在' });
    }
    productsData[name] = productsData[oldName];
    delete productsData[oldName];
    saveData();
    res.json({ success: true });
});

// 删除分类
app.delete('/api/categories/:category', (req, res) => {
    const categoryName = req.params.category;
    if (!productsData[categoryName]) {
        return res.status(404).json({ error: '分类不存在' });
    }
    
    delete productsData[categoryName];
    saveData();
    res.json({ success: true });
});

// 添加商品
app.post('/api/products/:category', express.json(), (req, res) => {
    const { category } = req.params;
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: '商品信息不完整' });
    }
    if (!productsData[category]) {
        return res.status(404).json({ error: '分类不存在' });
    }
    if (productsData[category].some(p => p.name === name)) {
        return res.status(400).json({ error: '商品已存在' });
    }
    productsData[category].push({ name, price: Number(price) });
    saveData();
    res.json({ success: true });
});

// 修改商品
app.put('/api/products/:category/:product', express.json(), (req, res) => {
    const { category, product } = req.params;
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: '商品信息不完整' });
    }
    if (!productsData[category]) {
        return res.status(404).json({ error: '分类不存在' });
    }
    const productIndex = productsData[category].findIndex(p => p.name === product);
    if (productIndex === -1) {
        return res.status(404).json({ error: '商品不存在' });
    }
    productsData[category][productIndex] = { name, price: Number(price) };
    saveData();
    res.json({ success: true });
});

// 删除商品
app.delete('/api/products/:category/:product', (req, res) => {
    const { category, product } = req.params;
    if (!productsData[category]) {
        return res.status(404).json({ error: '分类不存在' });
    }
    const productIndex = productsData[category].findIndex(p => p.name === product);
    if (productIndex === -1) {
        return res.status(404).json({ error: '商品不存在' });
    }
    productsData[category].splice(productIndex, 1);
    saveData();
    res.json({ success: true });
});

// 保存数据到文件
function saveData() {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(productsData, null, 4),
        'utf8'
    );
}

// 添加重载数据的API
app.post('/api/reload', (req, res) => {
    try {
        const newData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8')
        );
        fs.writeFileSync(dataFile, JSON.stringify(newData, null, 4), 'utf8');
        // 重新加载数据
        Object.assign(productsData, newData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '重载数据失败' });
    }
});

app.post('/api/reset', (req, res) => {
    try {
        const defaultData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8')
        );
        fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 4), 'utf8');
        Object.assign(productsData, defaultData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '重置数据失败' });
    }
});

// 定期检查更新（每小时检查一次）
setInterval(checkAndUpdateData, 3600000);

// 添加手动检查更新的API
app.post('/api/check-update', (req, res) => {
    try {
        checkAndUpdateData();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '检查更新失败' });
    }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = server; 