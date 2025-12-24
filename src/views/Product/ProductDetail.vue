<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getProductDetail, Product, updateProduct, getProductReviews } from '../../api/product'
import { useRoute } from 'vue-router'
import { addToCart } from '../../api/cart'
import { ElMessage } from 'element-plus'
import {
  Back,
  ShoppingCart,
  Edit,
  ChatDotRound,
  CollectionTag,
  UserFilled
} from "@element-plus/icons-vue";
import { router } from "../../router";
import '../../utils/global.css'

// 评论加载
const reviews = ref<any[]>([])
const reviewsLoading = ref(true)
const activeTab = ref('specs') // 控制下方 Tab 切换

const fetchProductReviews = async () => {
  try {
    const productId = Number(route.params.id)
    if (isNaN(productId)) throw new Error('无效的商品 ID')
    const reviewsRes = await getProductReviews(productId)
    reviews.value = reviewsRes.data.data
  } catch (error) {
    console.error("获取商品评论失败", error)
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

// 库存状态辅助函数
const getStockStatus = (stock: number) => {
  if (stock <= 0) return { type: 'info', text: '暂时缺货' };
  if (stock < 10) return { type: 'danger', text: '库存紧张' };
  return { type: 'success', text: '现货充足' };
}
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="handleBack" link class="back-link">
          <el-icon><Back /></el-icon> 返回列表
        </el-button>
        <span class="header-breadcrumb" v-if="product">
          {{ categoryMap[product.category] }} / {{ product.title }}
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="main-wrapper loading-wrapper">
      <el-skeleton style="width: 100%" animated>
        <template #template>
          <div style="display: flex; gap: 40px;">
            <el-skeleton-item variant="image" style="width: 400px; height: 400px" />
            <div style="flex: 1">
              <el-skeleton-item variant="h1" style="width: 50%; margin-bottom: 20px" />
              <el-skeleton-item variant="text" style="margin-bottom: 10px" />
              <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 30px" />
              <el-skeleton-item variant="button" style="width: 150px; height: 50px" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="main-wrapper error-wrapper">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="fetchProduct">重试</el-button>
        </template>
      </el-result>
    </div>

    <!-- 商品详情主体 -->
    <div v-else-if="product" class="main-wrapper">
      <!-- 上部：图片与核心信息 -->
      <div class="product-hero">
        <!-- 左侧图片 -->
        <div class="hero-image">
          <el-image
              :src="product.cover"
              class="main-img"
              fit="contain"
              :preview-src-list="[product.cover]"
          />
        </div>

        <!-- 右侧信息 -->
        <div class="hero-info">
          <div class="info-header">
            <el-tag effect="dark" class="category-tag">{{ categoryMap[product.category] || '通用' }}</el-tag>
            <h1 class="product-title">{{ product.title }}</h1>
          </div>

          <div class="product-meta">
            <p class="description">{{ product.description || '暂无简介' }}</p>
            <div class="rating-row">
              <el-rate
                  v-model="product.rate"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value} 分"
              />
              <span class="review-count">({{ reviews.length }} 条评价)</span>
            </div>
          </div>

          <div class="price-panel">
            <div class="price-box">
              <span class="currency">¥</span>
              <span class="amount">{{ product.price }}</span>
            </div>
            <div class="stock-info">
              <el-tag :type="getStockStatus(product.stockAmount).type" effect="plain" round>
                {{ getStockStatus(product.stockAmount).text }}
              </el-tag>
              <span class="stock-num">库存: {{ product.stockAmount }}</span>
              <span class="frozen-num" v-if="product.frozen > 0">(冻结: {{ product.frozen }})</span>
            </div>
          </div>

          <div class="action-bar">
            <el-button
                type="primary"
                size="large"
                class="cart-btn"
                @click="addProductToCart"
                :disabled="product.stockAmount <= 0"
            >
              <el-icon><ShoppingCart /></el-icon> 加入购物车
            </el-button>

            <el-button
                v-if="isAdmin"
                size="large"
                class="edit-btn"
                @click="openEditDialog"
            >
              <el-icon><Edit /></el-icon> 编辑商品
            </el-button>
          </div>
        </div>
      </div>

      <!-- 下部：详情与评论 Tab -->
      <div class="product-content">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="规格参数" name="specs">
            <template #label>
              <span class="custom-tab-label">
                <el-icon><CollectionTag /></el-icon> 规格参数
              </span>
            </template>
            <div class="specs-container">
              <el-descriptions :column="1" border class="spec-desc">
                <el-descriptions-item
                    v-for="spec in product.specifications"
                    :key="spec.id"
                    :label="spec.item"
                    label-class-name="spec-label"
                >
                  {{ spec.value }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <el-tab-pane label="用户评价" name="reviews">
            <template #label>
              <span class="custom-tab-label">
                <el-icon><ChatDotRound /></el-icon> 用户评价 ({{ reviews.length }})
              </span>
            </template>

            <div class="reviews-container" v-loading="reviewsLoading">
              <template v-if="reviews.length > 0">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                  <div class="review-header">
                    <el-avatar :size="32" :icon="UserFilled" class="review-avatar" />
                    <div class="review-meta">
                      <span class="review-user">匿名用户</span>
                      <el-rate v-model="review.rating" disabled size="small" />
                    </div>
                  </div>
                  <div class="review-content">{{ review.comment }}</div>
                  <div v-if="review.photoUrl" class="review-images">
                    <el-image
                        :src="review.photoUrl"
                        fit="cover"
                        class="review-img"
                        :preview-src-list="[review.photoUrl]"
                    />
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无评论，快来抢沙发吧！" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-if="isAdmin" v-model="editDialogVisible" title="编辑商品信息" width="600px" align-center>
      <el-form :model="editForm" label-width="80px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="书名">
              <el-input v-model="editForm.title" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类">
              <el-select v-model="editForm.category" style="width: 100%">
                <el-option v-for="(label, value) in categoryMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格">
              <el-input-number v-model="editForm.price" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="editForm.stockAmount" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">规格参数</el-divider>
        <div class="spec-edit-list">
          <div v-for="(spec, index) in editForm.specifications" :key="index" class="spec-edit-item">
            <el-input v-model="spec.item" placeholder="属性名" style="width: 120px" />
            <span class="spec-sep">:</span>
            <el-input v-model="spec.value" placeholder="属性值" style="flex: 1" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存更改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --bg-color: #f5f7fa;
  --primary-color: #409eff;
  --text-main: #303133;
  --text-secondary: #909399;
  --price-color: #f56c6c;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

/* 顶部导航 */
.page-header {
  background: #fff;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  font-size: 15px;
  color: #606266;
}
.back-link:hover {
  color: var(--primary-color);
}

.header-breadcrumb {
  font-size: 14px;
  color: #909399;
  padding-left: 16px;
  border-left: 1px solid #dcdfe6;
}

/* 主容器 */
.main-wrapper {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.loading-wrapper, .error-wrapper {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
}

/* 商品 Hero 区域 */
.product-hero {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  gap: 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.hero-image {
  flex-shrink: 0;
  width: 400px;
  height: 400px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fcfcfc;
}

.main-img {
  width: 100%;
  height: 100%;
}

.hero-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: 12px;
}

.category-tag {
  margin-bottom: 8px;
}

.product-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.3;
}

.product-meta {
  margin-bottom: 24px;
}

.description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-count {
  font-size: 13px;
  color: #909399;
}

/* 价格面板 */
.price-panel {
  background: #fdf5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.price-box {
  color: var(--price-color);
  font-weight: bold;
  line-height: 1;
  margin-bottom: 10px;
}

.currency {
  font-size: 20px;
  margin-right: 4px;
}

.amount {
  font-size: 36px;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.frozen-num {
  color: #909399;
  font-size: 12px;
}

/* 操作栏 */
.action-bar {
  margin-top: auto;
  display: flex;
  gap: 16px;
}

.cart-btn {
  flex: 1;
  max-width: 240px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  border: none;
  transition: transform 0.2s;
}

.cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 126, 95, 0.4);
}
.cart-btn:disabled {
  background: #c0c4cc;
  transform: none;
  box-shadow: none;
}

.edit-btn {
  height: 50px;
}

/* 下方内容区 */
.product-content {
  margin-top: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
}

/* 规格参数 */
.specs-container {
  max-width: 800px;
  margin: 20px 0;
}

:deep(.spec-label) {
  width: 150px;
  background-color: #fafafa;
  font-weight: 600;
}

/* 评论区 */
.reviews-container {
  padding: 10px 0;
}

.review-card {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0;
}
.review-card:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-avatar {
  background: #e6f7ff;
  color: #409eff;
}

.review-meta {
  display: flex;
  flex-direction: column;
}

.review-user {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.review-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-images {
  margin-top: 10px;
}

.review-img {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* 编辑弹窗 */
.spec-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-edit-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spec-sep {
  font-weight: bold;
  color: #909399;
}

/* 响应式 */
@media (max-width: 992px) {
  .product-hero {
    flex-direction: column;
    gap: 20px;
  }

  .hero-image {
    width: 100%;
    height: 300px;
  }
}
</style>