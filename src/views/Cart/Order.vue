<!-- src/views/Order.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { submitOrder, initiatePayment } from '../../api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const shippingAddress = ref({
  name: '',
  phone: '',
  address: '',
  zipCode: ''
})
const paymentMethod = ref('ALIPAY')
const paymentForm = ref<string | null>(null)
const submitOrderAndPay = async () => {
  try {
    // 提交订单
    const orderResponse = await submitOrder({

      cartItemIds: ['10'], // 从购物车页面传递过来的商品ID列表
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value
    })

    const orderId = orderResponse.data.data.orderId

    // 发起支付
    const paymentResponse = await initiatePayment(orderId)

    // 显示支付表单
    paymentForm.value = paymentResponse.data.data.paymentForm
    // 这里需要根据实际情况处理支付表单的展示，可能需要使用 v-html 或其他方式

    ElMessage.success('订单提交成功，请完成支付')
  } catch (error) {
    ElMessage.error('订单提交失败')
  }
}
const goBack = () => {
  router.push('/cart')
}
</script>

<template>
  <div class="order-container">
    <h1>提交订单</h1>
    <el-form :model="shippingAddress" label-width="100px">
      <el-form-item label="收货人姓名">
        <el-input v-model="shippingAddress.name"></el-input>
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="shippingAddress.phone"></el-input>
      </el-form-item>
      <el-form-item label="收货地址">
        <el-input v-model="shippingAddress.address"></el-input>
      </el-form-item>
      <el-form-item label="邮政编码">
        <el-input v-model="shippingAddress.zipCode"></el-input>
      </el-form-item>
    </el-form>

    <el-radio-group v-model="paymentMethod">
      <el-radio label="ALIPAY">支付宝</el-radio>
    </el-radio-group>

    <el-button type="primary" @click="submitOrderAndPay">提交订单并支付</el-button>
    <el-button @click="goBack">返回购物车</el-button>
    <div v-if="paymentForm" v-html="paymentForm"></div>
  </div>
</template>

<style scoped>
.order-container {
  padding: 20px;
}
</style>