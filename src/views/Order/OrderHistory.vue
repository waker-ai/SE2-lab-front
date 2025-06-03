<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHistoryOrders, OrderVO } from '../../api/order.ts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const historyOrders = ref<OrderVO[]>([])
const loading = ref(true)
const router = useRouter()

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
  <div class="order-history-wrapper">
    <div class="order-history-card">
      <div class="header-bar">
        <h2 class="title">历史订单</h2>
        <el-button type="primary" @click="goBack">返回</el-button>
      </div>

      <el-table
          :data="historyOrders"
          v-loading="loading"
          style="width: 100%"
          stripe
          class="order-table"
          @row-click="goToOrderDetail"
      >
        <el-table-column prop="orderId" label="订单号" />
        <el-table-column prop="totalAmount" label="金额 (¥)" />
        <el-table-column prop="paymentMethod" label="支付方式" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="status" label="状态" />
      </el-table>

      <div v-if="!loading && historyOrders.length === 0" class="empty-hint">
        暂无历史订单
      </div>
    </div>
  </div>
</template>


<style scoped>
.order-history-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(to bottom right, #eef2f7, #e3e9f0);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

.order-history-card {
  width: 100%;
  max-width: 960px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  padding: 30px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
  position: relative;
  margin: 0;
}

.title::after {
  content: '';
  display: block;
  height: 3px;
  width: 60px;
  background-color: #409EFF;
  margin-top: 8px;
  border-radius: 2px;
}

.order-table {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-table :deep(.el-table__row:hover) {
  background-color: #f0f9ff;
}

.order-table :deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

.empty-hint {
  text-align: center;
  color: #999;
  margin-top: 30px;
  font-size: 16px;
}
</style>