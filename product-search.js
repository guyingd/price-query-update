const fs = require('fs');

// 读取商品数据
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));

function searchProduct(keyword) {
    const results = [];
    
    // 遍历所有分类和商品
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
    
    return results;
}

function displayResults(results) {
    if (results.length === 0) {
        console.log('未找到匹配的商品');
        return;
    }

    results.forEach(result => {
        console.log(`\n分类: ${result.category}`);
        console.log('------------------------');
        result.products.forEach(product => {
            console.log(`商品名: ${product.name}`);
            console.log(`价格: ¥${product.price}`);
            console.log('------------------------');
        });
    });
}

// 主程序
function main() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('欢迎使用商品价格查询系统');
    console.log('输入 "退出" 可以结束程序\n');

    function askQuestion() {
        readline.question('请输入要搜索的商品名称: ', (keyword) => {
            if (keyword === '退出') {
                console.log('感谢使用，再见！');
                readline.close();
                return;
            }

            const results = searchProduct(keyword);
            displayResults(results);
            askQuestion(); // 继续询问
        });
    }

    askQuestion();
}

// 运行程序
main(); 