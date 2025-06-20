<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {Search, ArrowLeft, Back} from '@element-plus/icons-vue'
import { getProductList, Product } from '../../api/product'
import '../../utils/global.css'

// 路由
const route = useRoute()
const router = useRouter()

// 搜索关键词
const keyword = ref('')

// 所有书籍数据
const books = ref<Product[]>([])

// 分类筛选
const categories = [
  { label: '全部', value: 'ALL' },
  { label: '文学', value: 'LITERATURE' },
  { label: '科技', value: 'TECH' },
  { label: '儿童', value: 'CHILDREN' },
  { label: '艺术', value: 'ART' }
]
const selectedCategory = ref('ALL')

// 搜索历史记录
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 5

// 新增定时器引用
let searchDelayTimer: ReturnType<typeof setTimeout> | null = null

// 搜索触发（供点击图标或输入框使用，不加延迟）
const handleSearch = async () => {
  const k = keyword.value.trim()
  if (!k) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  updateSearchHistory(k)
  const res = await getProductList()
  books.value = res.data.data || []
}

// 延迟触发搜索（仅用于监听输入变化）
const delayedSearch = () => {
  if (searchDelayTimer) {
    clearTimeout(searchDelayTimer)
  }
  searchDelayTimer = setTimeout(() => {
    const k = keyword.value.trim()
    if (!k) {
      books.value = []
      return
    }
    updateSearchHistory(k)
    getProductList().then(res => {
      books.value = res.data.data || []
    })
  }, 2000)
}

// 替换原本 watch(keyword) 监听为延迟调用
watch(keyword, () => {
  delayedSearch()
})


// 更新搜索历史记录
const updateSearchHistory = (newKeyword: string) => {
  const trimmed = newKeyword.trim()
  if (!trimmed) return

  const index = searchHistory.value.indexOf(trimmed)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }

  searchHistory.value.unshift(trimmed)

  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value.pop()
  }

  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 从历史记录中搜索
const searchFromHistory = (item: string) => {
  keyword.value = item
  handleSearch()
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}



// 分类过滤 + 关键词过滤
const filteredBooks = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const list = books.value.filter(book => book.title.toLowerCase().includes(k))
  if (selectedCategory.value === 'ALL') {
    return list
  } else {
    return list.filter(book => book.category === selectedCategory.value)
  }
})

// 跳转详情页
const goToDetail = (id: number) => {
  router.push(`/products/${id}`)
}

const handleBack = () => {
  router.push('/mainpage')
}

// 初始加载历史记录和查询参数
onMounted(() => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    searchHistory.value = JSON.parse(saved)
  }

  if (route.query.keyword) {
    keyword.value = String(route.query.keyword)
    handleSearch()
  }
})
</script>

<template>
  <el-main class="books-container">
    <!-- 返回按钮 -->
    <el-button @click="handleBack" type="primary" circle class="back-button">
      <el-icon><Back /></el-icon>
    </el-button>

    <!-- 搜索框 -->
    <el-input
        v-model="keyword"
        placeholder="请输入书名进行搜索"
        clearable
        size="large"
        style="width: 400px; margin-bottom: 20px"
    >
      <template #suffix>
        <el-icon @click="handleSearch" class="search-icon"><Search /></el-icon>
      </template>
    </el-input>

    <!-- 搜索历史 -->
    <div v-if="searchHistory.length" class="history-box">
      <div class="history-header">
        <span>最近搜索：</span>
        <el-button link size="small" @click="clearHistory">清空</el-button>
      </div>
      <div class="history-list">
        <el-tag
            v-for="item in searchHistory"
            :key="item"
            size="small"
            type="info"
            effect="plain"
            class="history-item"
            @click="searchFromHistory(item)"
        >
          {{ item }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：书籍展示 -->
      <el-col :span="20">
        <el-row :gutter="20" class="product-item-list">
          <template v-if="filteredBooks.length">
            <el-col :span="6" v-for="book in filteredBooks" :key="book.id">
              <el-card shadow="hover" class="book-card" @click="goToDetail(book.id!)">
                <img :src="book.cover" class="book-cover" />
                <div class="book-title">{{ book.title }}</div>
                <div class="book-price">￥{{ book.price }}</div>
                <div class="book-rate">评分：{{ book.rate }}</div>
              </el-card>
            </el-col>
          </template>
          <template v-else>
            <el-empty description="未找到相关书籍" />
          </template>
        </el-row>
      </el-col>

      <!-- 右侧：分类栏 -->
      <el-col :span="4">
        <div class="category-sidebar">
          <div
              v-for="cat in categories"
              :key="cat.value"
              :class="['category-item', { active: selectedCategory === cat.value }]"
              @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </div>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<style scoped>
.books-container {
  padding: 20px;
  text-align: center;
}

.book-card {
  text-align: center;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}
.book-card:hover {
  transform: scale(1.05);
}

.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.book-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.book-price,
.book-rate {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.category-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-left: 1px solid #ddd;
  align-items: center;
}

.category-item {
  width: 40px;
  padding: 6px 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
}

.category-item:hover {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.category-item.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
  font-weight: bold;
}

.search-icon {
  cursor: pointer;
  font-size: 20px;
  color: #409EFF;
}

.search-icon:hover {
  color: #66b1ff;
}

/* 搜索历史样式 */
.history-box {
  margin-bottom: 20px;
  text-align: left;
  width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.history-header {
  font-size: 14px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-item {
  cursor: pointer;
}
</style>
