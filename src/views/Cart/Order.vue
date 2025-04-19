<!-- src/views/Order.vue -->
<script setup lang="ts">
import { ref, nextTick ,onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { submitOrder, initiatePayment } from '../../api/order'
import { ElMessage } from 'element-plus'
import {getCartList} from "../../api/cart.ts";

const router = useRouter()
const shippingAddress = ref({
  name: '',
  phone: '',
  address: '',
  zipCode: ''
})
const cartItemIds = ref<string[]>([])
const paymentMethod = ref('ALIPAY')
const paymentForm = ref<string | null>(null)
interface CartItem {
  cartItemId: string;
  productId: number;
  title: string;
  price: number;
  description: string;
  cover: string;
  detail: string;
  quantity: number;
}
const fetchCartItems = async () => {
  try {
    const response = await getCartList()
    const cartData = response.data.data
    cartItemIds.value = cartData.items.map((item: CartItem) => item.cartItemId)
    console.log("购物车商品总数：", cartData.total)
    console.log("购物车总金额：", cartData.totalAmount)
  } catch (error) {
    ElMessage.error('获取购物车列表失败')
  }
}
const submitOrderAndPay = async () => {
  try {

    console.log("提交订单的 cartItemIds: ", cartItemIds.value);
    const orderResponse = await submitOrder({
      cartItemIds: cartItemIds.value,// 从购物车页面传递过来的商品ID列表
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value
    })

    console.log("orderResponse: ")
    console.log(orderResponse)

    const orderId = orderResponse.data.data.orderId

    // 发起支付
    try {
      const paymentResponse = await initiatePayment(orderId);
      if (paymentResponse.data.data.paymentForm) {
        paymentForm.value = paymentResponse.data.data.paymentForm;
      } else {
        throw new Error("支付表单数据为空");
      }
    } catch (error) {
      console.error("支付过程出现错误:", error);
      ElMessage.error("支付表单获取失败，请稍后再试");
    }

    //这里确保支付表单渲染后自动提交
    nextTick(() => {
      if (paymentForm.value) {
        const formElement = document.createElement('div');
        formElement.innerHTML = paymentForm.value;

        // 将支付表单动态添加到 DOM 中
        document.body.appendChild(formElement);

        // 自动提交支付表单
        const form = formElement.querySelector('form');
        if (form) {
          form.submit();
        }
      }
    });
    // 这里需要根据实际情况处理支付表单的展示，可能需要使用 v-html 或其他方式
    // console.log("支付表单内容：", paymentForm.value);
    ElMessage.success('订单提交成功，请完成支付')
  } catch (error) {
    ElMessage.error('订单提交失败')
    // console.error('支付过程出现错误: ', error);
  }
}
const goBack = () => {
  router.push('/cart')
}
onMounted(fetchCartItems)
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