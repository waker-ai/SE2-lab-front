<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, OrderDetailVO } from '../../api/order.ts'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const orderId = Number(route.params.id)

const orderDetail = ref<OrderDetailVO | null>(null)
const loading = ref(true)

const goBack = () => {
  router.back()
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
  <div class="order-detail-wrapper">
    <el-card class="order-detail" v-loading="loading" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>订单详情</h2>
          <el-button type="primary" @click="goBack">返回</el-button>
        </div>
      </template>

      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="订单号">{{ orderDetail?.orderId }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ orderDetail?.status }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ orderDetail?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ orderDetail?.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ orderDetail?.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ orderDetail?.receiverPhone }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>商品信息</el-divider>
      <el-table :data="orderDetail?.items || []" style="width: 100%">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="price" label="单价 (¥)" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.order-detail-wrapper {
  padding: 20px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

.order-detail {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>