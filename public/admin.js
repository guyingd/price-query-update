const { createApp, ref, onMounted, computed } = Vue;

const app = createApp({
    setup() {
        const categories = ref([]);
        const isDark = ref(false);
        const searchKeyword = ref('');
        const expandedCategories = ref(new Set());
        const showCategoryModal = ref(false);
        const showProductModal = ref(false);
        const editingCategory = ref(null);
        const editingProduct = ref(null);
        const currentCategory = ref(null);

        const categoryForm = ref({
            name: ''
        });

        const productForm = ref({
            name: '',
            price: 0
        });

        // 搜索功能
        const filteredCategories = computed(() => {
            if (!searchKeyword.value) return categories.value;
            
            const keyword = searchKeyword.value.toLowerCase();
            return categories.value.map(category => {
                // 如果分类名称匹配，返回整个分类
                if (category.category.toLowerCase().includes(keyword)) {
                    return category;
                }
                
                // 过滤匹配的商品
                const matchedProducts = category.products.filter(product =>
                    product.name.toLowerCase().includes(keyword) ||
                    product.price.toString().includes(keyword)
                );
                
                // 如果有匹配的商品，返回带有匹配商品的分类
                if (matchedProducts.length > 0) {
                    return {
                        ...category,
                        products: matchedProducts
                    };
                }
                
                return null;
            }).filter(Boolean); // 移除空值
        });

        // 折叠控制
        const toggleCategory = (index) => {
            const category = filteredCategories.value[index];
            if (expandedCategories.value.has(category.category)) {
                expandedCategories.value.delete(category.category);
            } else {
                expandedCategories.value.add(category.category);
            }
        };

        const expandAll = () => {
            filteredCategories.value.forEach((category) => {
                expandedCategories.value.add(category.category);
            });
        };

        const collapseAll = () => {
            expandedCategories.value.clear();
        };

        const handleSearch = () => {
            // 如果搜索关键词不为空，自动展开所有匹配的分类
            if (searchKeyword.value) {
                expandAll();
            }
        };

        // 加载所有分类
        const loadCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                categories.value = await response.json();
                // 默认展开第一个分类
                if (categories.value.length > 0) {
                    expandedCategories.value.add(0);
                }
            } catch (error) {
                console.error('加载分类失败:', error);
                alert('加载分类失败，请刷新页面重试');
            }
        };

        // 分类相关方法
        const showAddCategoryModal = () => {
            editingCategory.value = null;
            categoryForm.value = { name: '' };
            showCategoryModal.value = true;
        };

        const showEditCategoryModal = (category) => {
            editingCategory.value = category;
            categoryForm.value = { name: category.category };
            showCategoryModal.value = true;
        };

        const closeCategoryModal = () => {
            showCategoryModal.value = false;
            editingCategory.value = null;
            categoryForm.value = { name: '' };
        };

        const saveCategory = async () => {
            try {
                const url = editingCategory.value 
                    ? `/api/categories/${editingCategory.value.category}`
                    : '/api/categories';
                
                const method = editingCategory.value ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(categoryForm.value)
                });

                if (!response.ok) throw new Error('保存失败');
                
                await loadCategories();
                closeCategoryModal();
            } catch (error) {
                console.error('保存分类失败:', error);
                alert('保存分类失败，请重试');
            }
        };

        // 商品相关方法
        const showAddProductModal = (category) => {
            currentCategory.value = category;
            editingProduct.value = null;
            productForm.value = { name: '', price: 0 };
            showProductModal.value = true;
        };

        const showEditProductModal = (category, product) => {
            currentCategory.value = category;
            editingProduct.value = product;
            productForm.value = { ...product };
            showProductModal.value = true;
        };

        const closeProductModal = () => {
            showProductModal.value = false;
            currentCategory.value = null;
            editingProduct.value = null;
            productForm.value = { name: '', price: 0 };
        };

        const saveProduct = async () => {
            try {
                const url = editingProduct.value
                    ? `/api/products/${currentCategory.value.category}/${editingProduct.value.name}`
                    : `/api/products/${currentCategory.value.category}`;
                
                const method = editingProduct.value ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productForm.value)
                });

                if (!response.ok) throw new Error('保存失败');
                
                await loadCategories();
                closeProductModal();
            } catch (error) {
                console.error('保存商品失败:', error);
                alert('保存商品失败，请重试');
            }
        };

        const deleteProduct = async (category, product) => {
            if (!confirm('确定要删除这个商品吗？')) return;
            
            try {
                const response = await fetch(`/api/products/${category.category}/${product.name}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('删除失败');
                
                await loadCategories();
            } catch (error) {
                console.error('删除商品失败:', error);
                alert('删除商品失败，请重试');
            }
        };

        // 主题切换
        const toggleTheme = () => {
            isDark.value = !isDark.value;
            const theme = isDark.value ? 'dark' : 'light';
            ThemeManager.applyTheme(theme);
        };

        // 删除分类
        const deleteCategory = async (category) => {
            if (!confirm(`确定要删除分类"${category.category}"吗？\n注意：该分类下的所有商品都会被删除！`)) {
                return;
            }
            
            try {
                const response = await fetch(`/api/categories/${category.category}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('删除失败');
                
                await loadCategories();
            } catch (error) {
                console.error('删除分类失败:', error);
                alert('删除分类失败，请重试');
            }
        };

        onMounted(() => {
            const savedTheme = ThemeManager.getCurrentTheme();
            isDark.value = savedTheme === 'dark';
            loadCategories();
        });

        return {
            categories,
            filteredCategories,
            isDark,
            searchKeyword,
            expandedCategories,
            showCategoryModal,
            showProductModal,
            editingCategory,
            editingProduct,
            categoryForm,
            productForm,
            toggleTheme,
            handleSearch,
            toggleCategory,
            expandAll,
            collapseAll,
            showAddCategoryModal,
            showEditCategoryModal,
            closeCategoryModal,
            saveCategory,
            showAddProductModal,
            showEditProductModal,
            closeProductModal,
            saveProduct,
            deleteProduct,
            deleteCategory
        };
    }
});

app.mount('#app'); 