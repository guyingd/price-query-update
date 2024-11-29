const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server');

let mainWindow;

function createWindow() {
    // 创建加载窗口
    let loadingWindow = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // 显示加载页面
    loadingWindow.loadFile('resources/loading.html');

    // 创建主窗口
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: '君之恋成本查询系统',
        show: false,  // 先隐藏主窗口
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, './build/icon.ico')
    });

    // 设置窗口标题
    mainWindow.setTitle('君之恋成本查询系统');

    // 当主窗口准备好时显示
    mainWindow.once('ready-to-show', () => {
        loadingWindow.destroy();
        mainWindow.show();
    });

    // 设置菜单为中文
    const { Menu } = require('electron');
    const template = [
        {
            label: '文件',
            submenu: [
                { role: 'quit', label: '退出' }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '刷新' },
                { role: 'toggleDevTools', label: '开发者工具' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // 加载应用
    mainWindow.loadURL('http://localhost:3000');

    // 应用启动时检查更新
    fetch('http://localhost:3000/api/check-update', { method: 'POST' })
        .catch(error => console.error('检查更新失败:', error));

    // 当窗口关闭时触发
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
}); 