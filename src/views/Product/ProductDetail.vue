<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductDetail,Product} from '../../api/product'
import { useRoute } from 'vue-router'
import {addToCart} from '../../api/cart'
import {ElMessage} from "element-plus";


const route = useRoute()
const product = ref<Product|null>(null)
const loading=ref(true)
const error=ref<string|null>(null)


const fetchProduct = async () => {
  try {
    const productId = Number(route.params.id) // 强制转换为 number 类型
    if (isNaN(productId)) {
      throw new Error('无效的商品 ID')
    }
    const productRes = await getProductDetail(productId)

    console.log('Product response:', productRes);  // 调试打印

    product.value = productRes.data.data
  } catch (err) {
    console.error('获取商品详情失败:', err)
    error.value = '无法加载商品信息，请稍后再试'
    ElMessage.error('加载失败，请刷新页面')
  } finally {
    loading.value = false
  }
}
const categoryMap : Record<string, string>={
  'LITERATURE':'文学',
  'TECH':'科技',
  'CHILDREN':'儿童',
  'ART':'艺术',
}

onMounted(fetchProduct)
//模拟加入购物车
const addProductToCart=async()=>{
  const productID=route.params.id
  console.log(productID)
  if (typeof productID === 'string') {
    // await addToCart(productID, 1)
    // ElMessage.success('商品已加入购物车！')
    try {
      // 尝试添加商品到购物车
      const response = await addToCart(productID, 1);
      console.log(response)
      if (response.data.code === '200') {
        ElMessage.success('商品已加入购物车！');
      } else if (response.data.code === '400' && response.data.msg === '库存不足') {
        // 库存不足时的处理
        ElMessage.error('库存不足，无法添加商品到购物车！');
      } else {
        ElMessage.error('添加购物车失败，请稍后再试。');
      }
    } catch (error) {
      ElMessage.error('网络错误，无法添加商品到购物车！');
    }
  } else {
    ElMessage.error('无效的商品ID')
  }
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
          <p> 分类：<strong>{{ categoryMap[product.category] || '未分类' }}</strong></p>
          <p class="price">价格：<span>¥{{ product.price }}</span></p>
          <p>评分：<el-rate v-model="product.rate" disabled /></p>
          <p>库存：<strong>{{ product.stockAmount || '暂无库存信息' }}</strong></p> <!-- 库存数量 -->
          <p>冻结库存：<strong>{{ product.frozen || '无冻结库存' }}</strong></p> <!-- 冻结库存 -->
          <el-button type="primary" @click="addProductToCart">加入购物车</el-button>
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