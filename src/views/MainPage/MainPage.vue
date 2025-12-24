<template>
  <div class="page-container">
    <el-main class="main-wrapper">

      <!-- 广告轮播区域 -->
      <div class="carousel-section">
        <el-carousel :interval="5000" type="card" height="380px" arrow="hover" trigger="click">
          <el-carousel-item v-for="ad in advertisements" :key="ad.id" class="carousel-item">
            <el-image :src="ad.imgUrl" fit="cover" class="carousel-image">
              <template #placeholder>
                <div class="image-slot">Loading...</div>
              </template>
            </el-image>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 操作与筛选区域 (Sticky Header) -->
      <div class="toolbar-container">
        <!-- 上层：操作按钮 -->
        <div class="action-bar">
          <div class="left-actions">
            <!-- 管理员操作组 -->
            <el-button-group v-if="isAdmin" class="admin-group">
              <el-button type="primary" plain round @click="goToCreateAdvertisement">
                <i class="fas fa-ad"></i> 新增广告
              </el-button>
              <el-button type="primary" plain round @click="goToAdvertisementList">
                <i class="fas fa-list"></i> 广告列表
              </el-button>
              <el-button type="success" plain round @click="goToCreate">
                <i class="fas fa-plus"></i> 创建书籍
              </el-button>
              <el-button type="warning" plain round @click="goToManage">
                <i class="fas fa-cog"></i> 管理商品
              </el-button>
            </el-button-group>
          </div>

          <div class="right-actions">
            <el-button class="action-btn glass-btn" @click="goToHotProducts">
              <i class="fas fa-fire text-danger"></i> 热门书籍
            </el-button>
            <el-badge :value="0" :hidden="true" class="cart-badge"> <!-- 这里预留了购物车数量Badge -->
              <el-button type="primary" class="action-btn shadow-btn" @click="goToCart" round>
                <i class="fas fa-shopping-cart"></i> 我的购物车
              </el-button>
            </el-badge>
          </div>
        </div>

        <!-- 下层：分类标签 -->
        <div class="category-bar">
          <div class="category-scroll">
            <div
                v-for="cat in categories"
                :key="cat.value"
                :class="['category-pill', { active: selectedCategory === cat.value }]"
                @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 商品展示网格 -->
      <div class="book-grid-container">
        <transition-group name="list">
          <el-card
              v-for="book in filteredBooks"
              :key="book.id"
              class="book-card"
              :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }"
              shadow="hover"
              @click="goToDetail(book.id||0)"
          >
            <div class="card-image-wrapper">
              <el-image :src="book.cover" fit="cover" loading="lazy" class="book-cover" />
              <div class="hover-overlay">
                <span>查看详情</span>
              </div>
            </div>

            <div class="book-info">
              <h3 class="book-title" :title="book.title">{{ book.title }}</h3>

              <div class="book-meta">
                <div class="price-tag">
                  <span class="currency">￥</span>
                  <span class="amount">{{ book.price }}</span>
                </div>
                <div class="rate-tag" v-if="book.rate !== undefined">
                  <i class="fas fa-star text-warning"></i>
                  <span>{{ book.rate.toFixed(1) }}</span>
                </div>
                <div class="rate-tag no-rate" v-else>
                  暂无评分
                </div>
              </div>
            </div>
          </el-card>
        </transition-group>

        <!-- 空状态展示 -->
        <el-empty v-if="filteredBooks.length === 0" description="暂无相关书籍" />
      </div>

    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList, Product } from '../../api/product'
import { getAdvertisements, Advertisement } from "../../api/advertisement.ts"
import { ElMessage } from 'element-plus'

// --- 保持原有逻辑不变 ---
const books = ref<Product[]>([])
const advertisements = ref<Advertisement[]>([])
const router = useRouter()
const userRole = ref(sessionStorage.getItem('role'))
const isAdmin = computed(() => userRole.value === 'ADMINISTRATOR')

const fetchBooks = async () => {
  try {
    const response = await getProductList()
    books.value = response.data.data
  } catch (error) {
    console.error('获取书籍失败:', error)
    ElMessage.error('获取书籍数据失败')
  }
}

const fetchAdvertisements = async () => {
  try {
    const res = await getAdvertisements()
    advertisements.value = res.data
  } catch (error) {
    console.error('获取广告失败:', error)
    ElMessage.error('获取广告数据失败')
  }
}

const categories = [
  { label: '全部', value: 'ALL' },
  { label: '文学', value: 'LITERATURE' },
  { label: '科技', value: 'TECH' },
  { label: '儿童', value: 'CHILDREN' },
  { label: '艺术', value: 'ART' },
  { label: '历史', value: 'HISTORY' },
  { label: '小说', value: 'FICTION' }
]

const selectedCategory = ref('ALL')

const filteredBooks = computed(() => {
  if (selectedCategory.value === 'ALL') {
    return books.value
  } else {
    return books.value.filter(book => book.category === selectedCategory.value)
  }
})

onMounted(() => {
  fetchBooks()
  fetchAdvertisements()
})

const goToDetail = (id: number) => router.push(`/products/${id}`)
const goToManage = () => router.push('/admin/products')
const goToCreate = () => router.push('/createproduct')
const goToHotProducts = () => router.push('/HotProductsList')
const goToCart = () => router.push('/cart')
const goToCreateAdvertisement = () => router.push('/advertisement/edit')
const goToAdvertisementList = () => router.push('/advertisement')
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* --- 全局变量与基础设置 --- */
:root {
  --primary-color: #409eff;
  --primary-dark: #337ecc;
  --secondary-color: #67c23a;
  --text-main: #303133;
  --text-secondary: #909399;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --price-color: #f56c6c;
  --shadow-sm: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
  --radius-lg: 16px;
  --radius-md: 8px;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

.main-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* --- 轮播图区域 --- */
.carousel-section {
  margin-bottom: 30px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.carousel-item {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片填满且不变形 */
  display: block;
}

/* --- 工具栏区域 (Action Bar & Categories) --- */
.toolbar-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: var(--shadow-sm);
  position: sticky; /* 可选：让工具栏吸顶 */
  top: 10px;
  z-index: 100;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.admin-group .el-button {
  margin-left: 0;
  border-radius: 0;
}
.admin-group .el-button:first-child {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.admin-group .el-button:last-child {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.right-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.glass-btn {
  background: #f4f4f5;
  border: none;
  color: #606266;
}
.glass-btn:hover {
  background: #e9e9eb;
  color: var(--primary-color);
}

.text-danger {
  color: #f56c6c;
}

/* --- 分类标签 --- */
.category-bar {
  display: flex;
  justify-content: center;
}

.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px;
  /* 隐藏滚动条 */
  scrollbar-width: none;
}
.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  padding: 8px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
}

.category-pill:hover {
  color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.1);
}

.category-pill.active {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* --- 书籍网格 --- */
.book-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  padding: 0 4px; /* 避免阴影被截断 */
}

/* 卡片样式 */
.book-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background: var(--card-bg);
  position: relative;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
}

/* 图片容器 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4; /* 标准书籍比例 */
  overflow: hidden;
  background: #f9f9f9;
}

.book-cover {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.5s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

/* 悬停遮罩 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hover-overlay span {
  color: #fff;
  border: 1px solid #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

.book-card:hover .hover-overlay {
  opacity: 1;
}

/* 书籍信息 */
.book-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 12px 0;
  line-height: 1.4;
  /* 限制两行显示 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-tag {
  color: var(--price-color);
  font-weight: bold;
}

.currency {
  font-size: 12px;
}

.amount {
  font-size: 20px;
}

.rate-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.text-warning {
  color: #e6a23c;
}

/* --- Vue Transition 列表动画 --- */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute; /* 确保删除时布局平滑 */
}

/* --- 响应式调整 --- */
@media (max-width: 768px) {
  .main-wrapper {
    padding: 10px;
  }

  .carousel-section {
    height: auto !important;
  }
  .el-carousel__container {
    height: 200px !important;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .right-actions {
    margin-left: 0;
    justify-content: space-between;
  }

  .book-grid-container {
    grid-template-columns: repeat(2, 1fr); /* 手机端两列 */
    gap: 12px;
  }

  .book-title {
    font-size: 14px;
  }

  .amount {
    font-size: 16px;
  }
}
</style>