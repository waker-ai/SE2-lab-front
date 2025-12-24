<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, OrderDetailVO } from '../../api/order.ts'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Location,
  Document,
  CreditCard,
  Goods,
  User,
  Iphone
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const orderId = Number(route.params.id)

const orderDetail = ref<OrderDetailVO | null>(null)
const loading = ref(true)

const goBack = () => {
  router.back()
}

const goToReviewPage = (productId: number) => {
  router.push({
    path: '/review',
    query: {
      orderId: orderId,
      productId: productId
    }
  })
}

// 计算总金额 (如果后端API没有返回总价字段，我们前端计算展示)
const totalAmount = computed(() => {
  if (!orderDetail.value?.items) return 0
  return orderDetail.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// 根据状态获取标签颜色
const getStatusType = (status: string | undefined) => {
  if (!status) return 'info'
  const s = status.toUpperCase()
  if (['COMPLETED', 'FINISHED', 'PAID', '已完成', '已支付'].includes(s)) return 'success'
  if (['PENDING', 'UNPAID', '待支付'].includes(s)) return 'warning'
  if (['CANCELLED', '已取消'].includes(s)) return 'danger'
  return 'primary'
}

onMounted(async () => {
  try {
    const response = await getOrderDetail(orderId)
    if (response.data.code === '200') {
      orderDetail.value = response.data.data
    } else {
      ElMessage.error('获取订单详情失败: ' + response.data.msg)
    }
  } catch (e) {
    ElMessage.error('获取订单详情异常')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper" v-loading="loading">

      <!-- 顶部导航与标题 -->
      <div class="page-header">
        <el-button @click="goBack" link class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <div class="header-title">订单详情</div>
      </div>

      <!-- 状态横幅 -->
      <div class="status-banner" v-if="orderDetail">
        <div class="status-left">
          <div class="status-text">{{ orderDetail.status }}</div>
          <div class="order-id">订单号：{{ orderDetail.orderId }}</div>
        </div>
        <div class="status-right">
          <!-- 这里可以放操作按钮，如去支付等，目前暂无接口 -->
        </div>
      </div>

      <!-- 信息卡片区域 -->
      <div class="info-grid">
        <!-- 收货信息 -->
        <el-card shadow="never" class="info-card">
          <template #header>
            <div class="card-title">
              <el-icon><Location /></el-icon> 收货信息
            </div>
          </template>
          <div class="info-content">
            <div class="info-row">
              <el-icon class="label-icon"><User /></el-icon>
              <span class="label">收货人：</span>
              <span class="value">{{ orderDetail?.receiverName }}</span>
            </div>
            <div class="info-row">
              <el-icon class="label-icon"><Iphone /></el-icon>
              <span class="label">联系电话：</span>
              <span class="value">{{ orderDetail?.receiverPhone }}</span>
            </div>
          </div>
        </el-card>

        <!-- 订单基础信息 -->
        <el-card shadow="never" class="info-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon> 订单信息
            </div>
          </template>
          <div class="info-content">
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ orderDetail?.createTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式：</span>
              <span class="value">
                <el-tag size="small" effect="plain">{{ orderDetail?.paymentMethod }}</el-tag>
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 商品清单 -->
      <el-card shadow="never" class="product-card">
        <template #header>
          <div class="card-title">
            <el-icon><Goods /></el-icon> 商品清单
          </div>
        </template>

        <el-table
            :data="orderDetail?.items || []"
            style="width: 100%"
            :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
        >
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template #default="{ row }">
              <span class="product-name">{{ row.productName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="120" align="center">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" align="center">
            <template #default="{ row }">
              x {{ row.quantity }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">
              <span class="subtotal-text">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button
                  v-if="!row.reviewed"
                  type="primary"
                  link
                  size="small"
                  @click="goToReviewPage(row.productId)"
              >
                去评价
              </el-button>
              <el-tag v-else type="info" size="small">已评价</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部结算栏 -->
        <div class="order-footer">
          <div class="total-wrapper">
            <span class="total-label">实付款：</span>
            <span class="total-price">
              <span class="symbol">¥</span>{{ totalAmount.toFixed(2) }}
            </span>
          </div>
        </div>
      </el-card>

    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --bg-color: #f5f7fa;
  --primary-color: #409eff;
  --text-main: #303133;
  --text-secondary: #909399;
  --border-radius: 8px;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24px;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* 顶部 Header */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  font-size: 15px;
  color: #606266;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #dcdfe6;
}

/* 状态横幅 */
.status-banner {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  padding: 30px 40px;
  border-radius: var(--border-radius);
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-text {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.order-id {
  font-size: 14px;
  opacity: 0.9;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: var(--border-radius);
  border: none;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.info-content {
  padding: 10px 0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-main);
}
.info-row:last-child {
  margin-bottom: 0;
}

.label-icon {
  margin-right: 6px;
  color: var(--text-secondary);
}

.label {
  color: var(--text-secondary);
  margin-right: 8px;
}

.value {
  font-weight: 500;
}

/* 商品卡片 */
.product-card {
  border-radius: var(--border-radius);
  border: none;
}

.product-name {
  font-weight: 500;
}

.subtotal-text {
  font-weight: bold;
}

/* 底部结算 */
.order-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.total-wrapper {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 14px;
  color: var(--text-main);
}

.total-price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
  margin-left: 8px;
}

.symbol {
  font-size: 16px;
  margin-right: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .status-banner {
    padding: 20px;
  }

  .status-text {
    font-size: 20px;
  }

  .page-container {
    padding: 16px;
  }
}
</style>