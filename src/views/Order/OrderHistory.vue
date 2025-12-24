<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHistoryOrders, OrderVO } from '../../api/order.ts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Back,
  List,
  ArrowRight,
  Money,
  Timer
} from '@element-plus/icons-vue'

const historyOrders = ref<OrderVO[]>([])
const loading = ref(true)
const router = useRouter()

// 状态映射逻辑
const getStatusConfig = (status: string) => {
  const s = status ? status.toUpperCase() : ''
  if (['PAID', 'COMPLETED', 'FINISHED', '已支付', '已完成'].includes(s)) {
    return { type: 'success', label: status }
  }
  if (['PENDING', 'UNPAID', '待支付'].includes(s)) {
    return { type: 'warning', label: status }
  }
  if (['CANCELLED', 'CLOSED', '已取消', '已关闭'].includes(s)) {
    return { type: 'info', label: status }
  }
  return { type: '', label: status }
}

onMounted(async () => {
  try {
    const response = await getHistoryOrders()
    if (response.data.code === '200') {
      historyOrders.value = response.data.data
    } else {
      ElMessage.error('获取历史订单失败: ' + response.data.msg)
    }
  } catch (error) {
    ElMessage.error('获取历史订单异常')
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

const goToOrderDetail = (row: OrderVO) => {
  router.push({ name: 'OrderDetail', params: { id: row.orderId } })
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">

      <!-- 顶部导航 -->
      <div class="page-header">
        <el-button @click="goBack" link class="back-btn">
          <el-icon><Back /></el-icon> 返回上一页
        </el-button>
        <div class="header-title">
          <el-icon><List /></el-icon> 我的历史订单
        </div>
      </div>

      <!-- 订单列表卡片 -->
      <el-card shadow="never" class="order-card" :body-style="{ padding: '0' }">
        <el-table
            :data="historyOrders"
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
            class="custom-table"
            @row-click="goToOrderDetail"
        >
          <!-- 订单号 -->
          <el-table-column prop="orderId" label="订单号" min-width="180">
            <template #default="{ row }">
              <span class="order-id-text">{{ row.orderId }}</span>
            </template>
          </el-table-column>

          <!-- 支付方式 -->
          <el-table-column prop="paymentMethod" label="支付方式" width="140" align="center">
            <template #default="{ row }">
              <el-tag effect="plain" type="info" size="small">{{ row.paymentMethod }}</el-tag>
            </template>
          </el-table-column>

          <!-- 创建时间 -->
          <el-table-column prop="createTime" label="下单时间" width="180">
            <template #default="{ row }">
              <div class="time-col">
                <el-icon><Timer /></el-icon> {{ row.createTime }}
              </div>
            </template>
          </el-table-column>

          <!-- 金额 -->
          <el-table-column prop="totalAmount" label="订单金额" width="140" align="right">
            <template #default="{ row }">
              <div class="price-col">
                <span class="symbol">¥</span>{{ row.totalAmount.toFixed(2) }}
              </div>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusConfig(row.status).type" round>
                {{ getStatusConfig(row.status).label }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 操作引导 -->
          <el-table-column width="60" align="center">
            <template #default>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </template>
          </el-table-column>

          <!-- 空状态插槽 -->
          <template #empty>
            <el-empty description="您还没有相关的订单记录" :image-size="160" />
          </template>
        </el-table>
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
  justify-content: space-between;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.back-btn {
  font-size: 14px;
  color: #606266;
}
.back-btn:hover {
  color: var(--primary-color);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 卡片样式 */
.order-card {
  border-radius: 8px;
  border: none;
  overflow: hidden;
}

/* 表格样式优化 */
.custom-table {
  cursor: pointer;
}

.order-id-text {
  font-family: monospace; /* 等宽字体 */
  font-weight: 500;
  color: var(--text-main);
}

.time-col {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.price-col {
  color: #f56c6c; /* 价格红 */
  font-weight: bold;
  font-size: 16px;
}

.symbol {
  font-size: 12px;
  margin-right: 2px;
}

.arrow-icon {
  color: #dcdfe6;
  transition: transform 0.3s, color 0.3s;
}

/* 交互效果 */
:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #ecf5ff !important; /* 悬停浅蓝色背景 */
}

:deep(.el-table__row:hover) .arrow-icon {
  color: var(--primary-color);
  transform: translateX(4px); /* 箭头移动效果 */
}

/* 响应式 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .page-header {
    padding: 12px 16px;
  }
}
</style>