const { createApp, ref, onMounted } = Vue;

const app = createApp({
    setup() {
        const searchKeyword = ref('');
        const results = ref([]);
        const loading = ref(false);
        const isDark = ref(false);
        const expandedCategories = ref(new Set());

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

        // 搜索处理
        const handleSearch = async () => {
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
            handleSearch,
            toggleTheme,
            expandedCategories,
            toggleCategory,
            expandAll,
            collapseAll
        };
    }
});

// 挂载应用
app.mount('#app'); 