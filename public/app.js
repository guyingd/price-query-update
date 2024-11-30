const { createApp, ref, onMounted } = Vue;

const app = createApp({
    setup() {
        const searchKeyword = ref('');
        const results = ref([]);
        const loading = ref(false);
        const isDark = ref(false);
        const expandedCategories = ref(new Set());
        const isMenuOpen = ref(false);
        const searchInput = ref(null);

        // 切换分类折叠状态
        const toggleCategory = (index) => {
            const category = results.value[index];
            if (expandedCategories.value.has(category.category)) {
                expandedCategories.value.delete(category.category);
            } else {
                expandedCategories.value.add(category.category);
            }
        };

        // 展开所有分类
        const expandAll = () => {
            results.value.forEach((category) => {
                expandedCategories.value.add(category.category);
            });
        };

        // 折叠所有分类
        const collapseAll = () => {
            expandedCategories.value.clear();
        };

        // 加载所有分类
        const loadAllCategories = async () => {
            loading.value = true;
            try {
                const response = await fetch('/api/search');
                const data = await response.json();
                results.value = data;
                // 默认全部折叠
                expandedCategories.value.clear();
            } catch (error) {
                console.error('加载分类出错:', error);
                alert('加载分类时发生错误，请刷新页面重试');
            } finally {
                loading.value = false;
            }
        };

        // 搜索框焦点处理
        const handleSearchFocus = () => {
            // 移动端时，滚动到搜索框
            if (window.innerWidth <= 768) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        };

        // 搜索处理
        const handleSearch = async () => {
            // 移动端时，收起菜单
            if (isMenuOpen.value) {
                closeMenu();
            }

            if (!searchKeyword.value.trim()) {
                await loadAllCategories();
                return;
            }

            loading.value = true;
            try {
                const response = await fetch(`/api/search?keyword=${encodeURIComponent(searchKeyword.value)}`);
                const data = await response.json();
                results.value = data;
            } catch (error) {
                console.error('搜索出错:', error);
                alert('搜索时发生错误，请稍后重试');
            } finally {
                loading.value = false;
            }
        };

        // 主题切换
        const toggleTheme = () => {
            isDark.value = !isDark.value;
            const theme = isDark.value ? 'dark' : 'light';
            ThemeManager.applyTheme(theme);
        };

        // 切换菜单
        const toggleMenu = () => {
            isMenuOpen.value = !isMenuOpen.value;
            // 切换body滚动
            document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
        };

        // 关闭菜单
        const closeMenu = () => {
            isMenuOpen.value = false;
            document.body.style.overflow = '';
        };

        // 初始化主题和加载分类
        onMounted(() => {
            const savedTheme = ThemeManager.getCurrentTheme();
            isDark.value = savedTheme === 'dark';
            loadAllCategories();
        });

        return {
            searchKeyword,
            results,
            loading,
            isDark,
            expandedCategories,
            isMenuOpen,
            toggleMenu,
            closeMenu,
            handleSearch,
            toggleTheme,
            toggleCategory,
            expandAll,
            collapseAll,
            searchInput,
            handleSearchFocus
        };
    }
});

// 挂载应用
app.mount('#app'); 