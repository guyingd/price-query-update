// 主题管理
const ThemeManager = {
    // 获取当前主题
    getCurrentTheme() {
        return localStorage.getItem('theme') || 'light';
    },

    // 应用主题
    applyTheme(theme) {
        // 使用 requestAnimationFrame 确保在下一帧渲染
        requestAnimationFrame(() => {
            // 使用 CSS 变量动态更新主题颜色
            const root = document.documentElement;
            if (theme === 'dark') {
                root.style.setProperty('--primary', '#0070F3');
                root.style.setProperty('--background', '#000000');
                root.style.setProperty('--content', '#ECEDEE');
                root.style.setProperty('--card-background', '#18181B');
                root.style.setProperty('--hover', '#0060DF');
                root.style.setProperty('--border', '#27272A');
                root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
            } else {
                root.style.setProperty('--primary', '#0070F3');
                root.style.setProperty('--background', '#FFFFFF');
                root.style.setProperty('--content', '#11181C');
                root.style.setProperty('--card-background', '#F4F4F5');
                root.style.setProperty('--hover', '#0060DF');
                root.style.setProperty('--border', '#E4E4E7');
                root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
            }
            
            // 最后再更新 data-theme 属性
            root.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    },

    // 初始化主题
    init() {
        // 在 HTML 加载前就应用主题，防止闪烁
        const theme = this.getCurrentTheme();
        
        // 初始加载时直接设置，不使用动画
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--primary', '#0070F3');
            root.style.setProperty('--background', '#000000');
            root.style.setProperty('--content', '#ECEDEE');
            root.style.setProperty('--card-background', '#18181B');
            root.style.setProperty('--hover', '#0060DF');
            root.style.setProperty('--border', '#27272A');
            root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
        } else {
            root.style.setProperty('--primary', '#0070F3');
            root.style.setProperty('--background', '#FFFFFF');
            root.style.setProperty('--content', '#11181C');
            root.style.setProperty('--card-background', '#F4F4F5');
            root.style.setProperty('--hover', '#0060DF');
            root.style.setProperty('--border', '#E4E4E7');
            root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
        }
        root.setAttribute('data-theme', theme);

        // 添加过渡效果，但仅在初始加载后
        requestAnimationFrame(() => {
            // 使用 CSS 变量进行过渡
            root.style.setProperty('--transition-duration', '0.3s');
            root.style.setProperty('--transition-timing', 'ease');
            
            const transitionStyles = `
                background-color var(--transition-duration) var(--transition-timing),
                color var(--transition-duration) var(--transition-timing),
                border-color var(--transition-duration) var(--transition-timing),
                box-shadow var(--transition-duration) var(--transition-timing)
            `;
            
            root.style.transition = transitionStyles;
        });
    }
};

// 在 HTML 加载前就初始化主题
ThemeManager.init(); 