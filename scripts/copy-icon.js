const fs = require('fs');
const path = require('path');

// 确保 resources 目录存在
const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir);
}

// 复制图标文件
const iconSrc = path.join(__dirname, '..', 'build', 'icon.ico');
const iconDest = path.join(resourcesDir, 'icon.ico');

if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconDest);
  console.log('Icon copied successfully');
} else {
  console.error('Source icon not found');
  process.exit(1);
} 