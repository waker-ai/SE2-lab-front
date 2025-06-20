<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import { getProductDetail, Product, updateProduct, getProductReviews } from '../../api/product'
import { useRoute } from 'vue-router'
import { addToCart } from '../../api/cart'
import { ElMessage } from 'element-plus'
import {Back} from "@element-plus/icons-vue";
import {router} from "../../router";
import '../../utils/global.css'

// 评论加载
const reviews = ref<any[]>([])
const reviewsLoading = ref(true)
const fetchProductReviews = async () => {
  try {
    const productId = Number(route.params.id)
    if (isNaN(productId)) throw new Error('无效的商品 ID')
    const reviewsRes = await getProductReviews(productId)
    reviews.value = reviewsRes.data.data
  } catch (error) {
    console.error("获取商品评论失败", error)
    ElMessage.error('加载评论失败，请刷新页面')
  } finally {
    reviewsLoading.value = false
  }
}

// 编辑功能
const userRole = ref(sessionStorage.getItem('role'))
const isAdmin = computed(() => userRole.value === 'ADMINISTRATOR')
const editDialogVisible = ref(false)
const editForm = ref<Product>({
  id: 0,
  category: '',
  title: '',
  price: 0,
  stockAmount: 0,
  rate: 0,
  cover: '',
  description: '',
  detail: '',
  specifications: [],
  frozen: 0
} as Product)

const openEditDialog = () => {
  if (product.value) {
    editForm.value = JSON.parse(JSON.stringify(product.value))
    editDialogVisible.value = true
  }
}

const submitEdit = async () => {
  try {
    const res = await updateProduct(editForm.value)
    if (res.data.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      fetchProduct()
    } else {
      ElMessage.error(res.data.msg || '更新失败')
    }
  } catch (err) {
    ElMessage.error('请求失败')
    console.error(err)
  }
}

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchProduct = async () => {
  try {
    const productId = Number(route.params.id)
    if (isNaN(productId)) throw new Error('无效的商品 ID')
    const productRes = await getProductDetail(productId)
    product.value = productRes.data.data
  } catch (err) {
    console.error('获取商品详情失败:', err)
    error.value = '无法加载商品信息，请稍后再试'
    ElMessage.error('加载失败，请刷新页面')
  } finally {
    loading.value = false
  }
}

const categoryMap: Record<string, string> = {
  'LITERATURE': '文学',
  'TECH': '科技',
  'CHILDREN': '儿童',
  'ART': '艺术',
}

onMounted(() => {
  fetchProduct()
  fetchProductReviews()
})

const addProductToCart = async () => {
  const productID = route.params.id
  if (typeof productID === 'string') {
    try {
      const response = await addToCart(productID, 1)
      if (response.data.code === '200') {
        ElMessage.success('商品已加入购物车！')
      } else if (response.data.code === '400' && response.data.msg === '库存不足') {
        ElMessage.error('库存不足，无法添加商品到购物车！')
      } else {
        ElMessage.error('添加购物车失败，请稍后再试。')
      }
    } catch (error) {
      ElMessage.error('网络错误，无法添加商品到购物车！')
    }
  } else {
    ElMessage.error('无效的商品ID')
  }
}

// 返回处理
const handleBack = () => {
  router.back();
}
</script>

<template>
  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class = "back-button">
    <el-icon><Back /></el-icon>
  </el-button>

  <el-card v-if="loading" class="loading-card el-card">
    <el-skeleton animated :rows="6" />
  </el-card>

  <div v-else-if="error" class="error-message">
    <el-alert type="error" :title="error" show-icon />
  </div>

  <div v-else-if="product" class="product-detail">
    <el-card class="el-card">
      <div class="product-header">
        <div class="cover-wrapper">
          <el-image :src="product.cover" class="cover" fit="cover" />
        </div>
        <div class="info">
          <h2>{{ product.title }}</h2>
          <p>分类：<strong>{{ categoryMap[product.category] || '未分类' }}</strong></p>
          <p class="price">价格：<span>¥{{ product.price }}</span></p>
          <p>评分：<el-rate v-model="product.rate" disabled :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />{{ product.rate?.toFixed(2) || '暂无评分' }}</p>
          <p>库存：<strong>{{ product.stockAmount || '暂无库存信息' }}</strong></p>
          <p>冻结库存：<strong>{{ product.frozen || '无冻结库存' }}</strong></p>
          <el-button type="primary" @click="addProductToCart" class="el-button">加入购物车</el-button>
          <el-button v-if="isAdmin" type="warning" plain @click="openEditDialog" class="el-button">修改商品信息</el-button>
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

      <div class="product-reviews">
        <h3>商品评论</h3>
        <el-skeleton v-if="reviewsLoading" animated :rows="3" />
        <div v-else>
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <p>评分：<el-rate v-model="review.rating" disabled /></p>
            <p>评论：{{ review.comment }}</p>
            <el-image v-if="review.photoUrl" :src="review.photoUrl" fit="cover" style="width: 150px; margin-top: 10px" />
          </div>
          <p v-if="reviews.length === 0">暂无评论</p>
        </div>
      </div>
    </el-card>
  </div>

  <el-dialog v-if="isAdmin" v-model="editDialogVisible" title="修改商品信息" width="600px">
    <el-form :model="editForm" label-width="100px">
      <el-form-item label="书名">
        <el-input v-model="editForm.title" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="editForm.category" placeholder="请选择分类">
          <el-option v-for="(label, value) in categoryMap" :key="value" :label="label" :value="value" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model.number="editForm.price" type="number" />
      </el-form-item>
      <el-form-item label="库存">
        <el-input v-model.number="editForm.stockAmount" type="number" />
      </el-form-item>
      <el-form-item label="规格说明">
        <div v-for="(spec, index) in editForm.specifications" :key="index" style="margin-bottom: 8px;">
          <el-input v-model="spec.item" placeholder="项名" style="width:45%; margin-right:5%" />
          <el-input v-model="spec.value" placeholder="值" style="width:45%" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitEdit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.product-detail {
  padding: 40px 0;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
}

.el-card {
  max-width: 960px;
  width: 100%;
  background: #fff;
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  padding: 30px;
}


.product-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.el-button {
  border-radius: 999px !important;
  padding: 10px 20px !important;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.3s;
}


.el-button:hover {
  transform: scale(1.05);
}

.cover-wrapper {
  flex-shrink: 0;
  width: 300px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.cover:hover {
  transform: scale(1.05);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info h2 {
  font-size: 24px;
  margin: 0;
  font-weight: 600;
}

.price span {
  font-size: 22px;
  color: #e53935;
  font-weight: bold;
}

.el-button {
  margin-top: 10px;
  transition: transform 0.2s;
}

.el-button:hover {
  transform: scale(1.03);
}

.specifications,
.product-reviews {
  margin-top: 30px;
}

.specifications h3,
.product-reviews h3 {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.specifications ul {
  list-style: none;
  padding: 0;
  font-size: 14px;
  color: #555;
}

.review-item {
  border: 1px solid #e0e0e0;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.error-message {
  text-align: center;
  color: #f56c6c;
  font-size: 16px;
  margin-top: 20px;
}

.loading-card {
  width: 100%;
  max-width: 600px;
  margin: 50px auto;
}
</style>