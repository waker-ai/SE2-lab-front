<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductDetail, getProductStock,Product,Stock} from '../../api/product'
import { useRoute } from 'vue-router'
import {ElMessage} from "element-plus";


const route = useRoute()
const product = ref<Product|null>(null)
const loading=ref(true)
const stock = ref<Stock|null>(null)
const error=ref<string|null>(null)


const fetchProduct = async () => {
  try {
    const productId = Number(route.params.id) // 强制转换为 number 类型
    if (isNaN(productId)) {
      throw new Error('无效的商品 ID')
    }
    const [productRes, stockRes] = await Promise.all([
      getProductDetail(productId),
      getProductStock(productId)
    ])
    product.value = productRes.data
    stock.value = stockRes.data
  } catch (err) {
    console.error('获取商品详情失败:', err)
    error.value = '无法加载商品信息，请稍后再试'
    ElMessage.error('加载失败，请刷新页面')
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
//模拟加入购物车
const addToCart=()=>{
  ElMessage.success('商品已加入购物车！')
}
</script>

<template>
  <el-card v-if="loading" class="loading-card">
    <el-skeleton animated:row="6"/>
  </el-card>

  <div v-else-if="error" class="error-message">
    <el-alert type="error" :title="error" show-icon/>
  </div>

  <div v-else-if="product" class="product-detail">
    <el-card>
      <div class="product-header">
        <el-image :src="product.cover" class="cover" fit="cover"/>
        <div class="info">
          <h2>{{ product.title }}</h2>
          <p class="price">价格：<span>¥{{ product.price }}</span></p>
          <p>评分：<el-rate v-model="product.rate" disabled /></p>
          <p>库存：<strong>{{ stock?.amount || '暂无库存信息' }}</strong></p>
          <el-button type="primary" @click="addToCart">加入购物车</el-button>
        </div>
      </div>

      <div class="specifications">
        <h3>规格说明</h3>
        <ul>
          <li v-for="spec in product.specifications" :key="spec.id">
            {{ spec.item }}：{{ spec.value }}
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.product-detail{
  padding:20px;
}

.loading-card{
  width:100%;
  max-width:600px;
  margin: 50px auto;
}

.error-message{
  text-align: center;
  color: red;
  font-size:16px;
  margin-top:20px;
}

.product-header{
  display:flex;
  gap:20px;
  align-items: center;
}

.cover{
  width:200px;
  height:280px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
}

.info{
  flex-grow: 1;
}

.price span{
  font-size: 20px;
  font-weight: bold;
  color:#ff4d4f;
}

.specifications {
  margin-top: 20px;
}

.specifications ul {
  list-style: none;
  padding: 0;
}

.specifications li {
  font-size: 14px;
  margin-bottom: 5px;
}
</style>