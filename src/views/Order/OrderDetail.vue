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

const goToReviewPage = (productId: number) => {
  router.push({
    path: '/review',
    query: {
      orderId: orderId,
      productId: productId
    }
  })
}
onMounted(async () => {
  try {
    const response = await getOrderDetail(orderId)
    if (response.data.code === '200') {
      orderDetail.value = response.data.data
      // console.log(orderDetail.value?.items)
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
    <el-card class="order-detail" v-loading="loading" shadow="always">
      <template #header>
        <div class="card-header">
          <h2 class="title">订单详情</h2>
          <el-button type="primary" @click="goBack" class="el-button">返回</el-button>
        </div>
      </template>

      <el-descriptions
          title="基本信息"
          :column="2"
          border
          class="descriptions-custom"
      >
        <el-descriptions-item label="订单号">{{ orderDetail?.orderId }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ orderDetail?.status }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ orderDetail?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ orderDetail?.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ orderDetail?.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ orderDetail?.receiverPhone }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">商品信息</el-divider>

      <el-table :data="orderDetail?.items || []" style="width: 100%" class="product-table" stripe>
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="price" label="单价 (¥)" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button class="el-button"
                       v-if="!row.reviewed"
                       type="primary"
                       size="small"
                       plain
                       round
                       @click="goToReviewPage(row.productId)"
            >
              去评价
            </el-button>
            <el-button class="el-button"
                       v-else
                       type="success"
                       size="small"
                       round
                       disabled
            >
              已评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>


<style scoped>
.order-detail-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(to bottom right, #eef2f7, #e3e9f0);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.order-detail {
  width: 100%;
  max-width: 960px;
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  padding: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.descriptions-custom :deep(.el-descriptions__label) {
  font-weight: 600;
  background-color: #f0f2f5;
}

.descriptions-custom :deep(.el-descriptions__cell) {
  padding: 12px 18px;
  font-size: 14px;
}

.product-table {
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-table :deep(.el-table__row:hover) {
  background-color: #f2f9ff;
}

.el-button {
  transition: transform 0.15s ease;
}

.el-button:hover {
  transform: scale(1.04);
}
</style>
