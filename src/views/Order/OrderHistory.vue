<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHistoryOrders, OrderVO } from '../../api/order.ts'
import { ElMessage } from 'element-plus'
import {useRouter} from "vue-router";

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
  <div class="order-history-container">
    <h2>历史订单</h2>
    <el-button type="primary" @click="goBack">返回</el-button>
    <el-table
        :data="historyOrders"
        v-loading="loading"
        style="width: 100%"
        @row-click="goToOrderDetail"
    >

      <el-table-column prop="orderId" label="订单号" />
      <el-table-column prop="totalAmount" label="金额" />
      <el-table-column prop="paymentMethod" label="支付方式" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="status" label="状态" />
    </el-table>
    <div v-if="!loading && historyOrders.length === 0">暂无历史订单</div>
  </div>
</template>

<style scoped>
.order-history-container {
  padding: 20px;
}
</style>