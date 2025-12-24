<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getProductsBySales, getProductsByScore } from '../../api/products_list.ts'
import { useRouter } from 'vue-router'
import { Back, Trophy, TrendCharts, Medal } from "@element-plus/icons-vue";
import '../../utils/global.css'

const router = useRouter()

// 定义接口
interface Product {
  id: number;
  category: string;
  sales: number;
  score: number;
  title: string;
  price: number;
  rate: number;
  description: string;
  cover: string;
  detail: string;
  specifications: { item: string; value: string }[];
  amount: number;
  frozen: number;
}

const activeTab = ref('score')
const products = ref<Product[]>([])
const currentPage = ref(0) // 注意：Element Plus 分页是从 1 开始，API 可能是 0，需转换
const pageSize = 10
const loading = ref(false)
const totalElements = ref(0) // 如果API返回总数最好，这里暂时模拟

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = activeTab.value === 'score'
        ? await getProductsByScore(currentPage.value, pageSize)
        : await getProductsBySales(currentPage.value, pageSize)

    // 假设后端返回结构 response.data.data.content
    products.value = response.data.data.content || []

    // 如果接口有返回 totalElements，请替换此处。
    // 目前逻辑保持原样：简单的分页计算
    // 这里的 totalElements 只是为了让 el-pagination 显示正确的页码数量
    // 假设总页数是根据当前返回长度估算的（或者是无限滚动逻辑），这里先给一个足够大的数或者根据原逻辑适配
    // 修正：原逻辑是 Math.ceil(products.value.length/10)，这看起来像是前端分页？
    // 如果是后端分页，应该返回 total。这里为了兼容 UI，暂设一个固定值或依赖 content 长度
    totalElements.value = 100; // 示例：假设有100条数据，让分页器显示

  } catch (error) {
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const changeTab = (tab: string) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  currentPage.value = 0
  fetchProducts()
}

// Element Pagination 改变页码事件 (val 是 1, 2, 3...)
const handleCurrentChange = (val: number) => {
  currentPage.value = val - 1 // 转回 API 需要的 0-based index
  fetchProducts()
  // 滚动回顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToProductDetail = (productId: number) => {
  router.push(`/products/${productId}`)
}

const handleBack = () => {
  router.push(`/mainpage`)
}

// 获取排名样式
const getRankClass = (index: number) => {
  const realRank = index + 1 + (currentPage.value * pageSize)
  if (realRank === 1) return 'rank-1'
  if (realRank === 2) return 'rank-2'
  if (realRank === 3) return 'rank-3'
  return 'rank-common'
}

onMounted(fetchProducts)
</script>

<template>
  <div class="page-container">
    <!-- 顶部 Banner 与 导航 -->
    <div class="header-section">
      <div class="nav-bar">
        <el-button @click="handleBack" circle plain class="glass-btn">
          <el-icon><Back /></el-icon>
        </el-button>
        <div class="header-title">商品排行榜</div>
      </div>

      <div class="banner-content">
        <h1 class="main-title">
          <el-icon class="title-icon"><Trophy /></el-icon>
          年度必买清单
        </h1>
        <p class="sub-title">精选全网好物 · 实时更新榜单</p>
      </div>

      <!-- Tab 切换 -->
      <div class="tab-wrapper">
        <div class="custom-tabs">
          <div
              class="tab-item"
              :class="{ active: activeTab === 'score' }"
              @click="changeTab('score')"
          >
            <el-icon><Medal /></el-icon> 好评榜
          </div>
          <div
              class="tab-item"
              :class="{ active: activeTab === 'sales' }"
              @click="changeTab('sales')"
          >
            <el-icon><TrendCharts /></el-icon> 热销榜
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表区域 -->
    <div class="content-wrapper" v-loading="loading">
      <div class="product-grid">
        <div
            v-for="(product, index) in products"
            :key="product.id"
            class="product-card"
            @click="goToProductDetail(product.id)"
        >
          <!-- 排名角标 -->
          <div class="rank-badge" :class="getRankClass(index)">
            <span v-if="index + 1 + (currentPage * pageSize) <= 3" class="crown-icon">♛</span>
            NO.{{ index + 1 + (currentPage * pageSize) }}
          </div>

          <!-- 图片 -->
          <div class="img-wrapper">
            <el-image
                :src="product.cover"
                loading="lazy"
                class="product-img"
                fit="contain"
            />
          </div>

          <!-- 信息 -->
          <div class="info-wrapper">
            <h3 class="title" :title="product.title">{{ product.title }}</h3>

            <div class="tags-row">
              <el-tag size="small" effect="plain" type="danger" v-if="activeTab === 'sales'">
                热销爆款
              </el-tag>
              <el-tag size="small" effect="plain" type="warning" v-else>
                口碑甄选
              </el-tag>
            </div>

            <div class="meta-row">
              <div class="price">
                <span class="symbol">￥</span>{{ product.price.toFixed(2) }}
              </div>
              <div class="stats">
                <span v-if="activeTab === 'sales'">销量 {{ product.sales }}+</span>
                <span v-else>评分 {{ (product.rate * 20).toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 (使用 Element Plus 组件) -->
      <div class="pagination-wrapper">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="totalElements"
            :page-size="pageSize"
            :current-page="currentPage + 1"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #ff5000; /* 电商橙红 */
  --gold: #eeb422;
  --silver: #999999;
  --bronze: #cd7f32;
  --bg-color: #f5f7fa;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

/* 头部设计 */
.header-section {
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%); /* 高级暗色渐变 */
  /* 或者使用更活泼的颜色: background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%); */
  color: white;
  padding: 20px 20px 60px 20px; /* 底部留白给 Tabs */
  position: relative;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  margin-bottom: 30px;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  max-width: 1200px;
  margin: 0 auto 20px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: white;
}

.header-title {
  margin-left: 15px;
  font-size: 18px;
  font-weight: 500;
}

.banner-content {
  text-align: center;
  margin-bottom: 30px;
}

.main-title {
  font-size: 32px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.sub-title {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
  letter-spacing: 2px;
}

/* Tabs 悬浮条 */
.tab-wrapper {
  position: absolute;
  bottom: -25px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.custom-tabs {
  background: white;
  border-radius: 30px;
  padding: 5px;
  display: flex;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.tab-item {
  padding: 10px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  color: #606266;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-item.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 80, 0, 0.3);
}

/* 内容区域 */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

/* 商品卡片 */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}

/* 排名角标 */
.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  padding: 4px 10px;
  border-bottom-right-radius: 12px;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}

.rank-1 { background: linear-gradient(45deg, #ffd700, #fdb931); }
.rank-2 { background: linear-gradient(45deg, #e0e0e0, #bdbdbd); }
.rank-3 { background: linear-gradient(45deg, #cd7f32, #a0522d); }
.rank-common { background: rgba(0,0,0,0.5); font-size: 12px; }

.crown-icon {
  margin-right: 2px;
}

/* 图片 */
.img-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1; /* 方形图片 */
  background: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.product-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

/* 信息区 */
.info-wrapper {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #333;
  line-height: 1.4;
  height: 42px; /* 限制两行高度 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags-row {
  margin-bottom: 8px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: bold;
}

.symbol {
  font-size: 14px;
}

.stats {
  font-size: 12px;
  color: #999;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-section {
    padding: 15px 15px 50px 15px;
  }
  .main-title {
    font-size: 24px;
  }
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .title {
    font-size: 13px;
    height: 36px;
  }
}
</style>