<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductsBySales, getProductsByScore } from '../../api/products_list.ts'
import { useRouter } from 'vue-router'
import {Back} from "@element-plus/icons-vue";
import '../../utils/global.css'


const router = useRouter()
interface Product{
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
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize=10

const fetchProducts = async () => {
  try {
    const response = activeTab.value === 'score'
        ? await getProductsByScore(currentPage.value,pageSize)
        : await getProductsBySales(currentPage.value,pageSize)
    products.value = response.data.data.content
    console.log(response.data.data)
    totalPages.value = Math.ceil(products.value.length/10)
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

const changeTab = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 0
  fetchProducts()
}

const changePage = (direction: number) => {
  if (direction === -1 && currentPage.value > 0) {
    currentPage.value--
  } else if (direction === 1 && currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
  fetchProducts()
}
const goToProductDetail = (productId: number) => {
  router.push(`/products/${productId}`)
}

// 返回处理
const handleBack = () => {
  router.push(`/mainpage`)
}

onMounted(fetchProducts)

</script>

<template>

  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class="back-button">
    <el-icon><Back /></el-icon>
  </el-button>

  <div class="hot-products">
    <div class="tabs">
      <button :class="{ active: activeTab === 'score' }" @click="changeTab('score')">好评榜</button>
      <button :class="{ active: activeTab === 'sales' }" @click="changeTab('sales')">热销榜</button>
    </div>

    <div class="product-list">
      <div v-for="(product, index) in products" :key="product.id" class="product-card">
        <div class="rank">NO.{{ index + 1 }}</div>
        <img :src="product.cover" :alt="product.title" class="product-image" @click="goToProductDetail(product.id)">
        <div class="product-info">
          <h3 class="product-title">{{ product.title }}</h3>
          <p class="product-price">￥{{ product.price.toFixed(2) }}</p>
          <p class="product-sales">销量：{{ product.sales }}</p>
          <p class="product-score">好评率：{{ (product.rate * 20).toFixed(1) }}%</p>
          <div class="product-tags">
            <span class="tag">30天热销</span>
            <span class="tag gold">精选好评</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button @click="changePage(-1)" :disabled="currentPage === 0">&lt;</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button @click="changePage(1)" :disabled="currentPage === totalPages - 1">&gt;</button>
    </div>
  </div>
</template>

<style scoped>
.hot-products {
  width: 100%;
  max-width: 1600px;
  max-height:900px;/* 放大最大宽度 */
  margin: 0 auto;
  padding: 20px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 12px;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  background-color: #2a2a2a;
  color: #ccc;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.3s;
}

.tabs button.active {
  background-color: #ff9800;
  color: #fff;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.rank {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ffcc00;
  color: #000;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 8px;
}

.product-info {
  text-align: left;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #fff;
}

.product-price {
  font-size: 18px;
  color: #ff5722;
  margin-bottom: 4px;
}

.product-sales,
.product-score {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 4px;
}

.product-tags {
  margin-top: 6px;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 12px;
  background-color: #555;
  border-radius: 4px;
  margin-right: 5px;
  color: #eee;
}

.tag.gold {
  background-color: #d4af37;
  color: #000;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 12px;
  margin: 0 10px;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:hover:not(:disabled) {
  background-color: #777;
}

.pagination button:disabled {
  background-color: #222;
  cursor: not-allowed;
}
</style>
