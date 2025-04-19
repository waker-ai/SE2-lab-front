<!-- src/views/Cart.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCartList, updateCartItem, removeCartItem } from '../../api/cart'
import { ElMessage } from 'element-plus'
import {useRouter} from "vue-router";
// import { cloneDeep } from 'lodash-es'
interface CartItem {
  cartItemId: string; // 购物车项ID
  title: string; // 商品名称
  price: number; // 价格
  quantity: number; // 当前数量
  originalQuantity: number; // 原始数量（新增字段）
  // 如果有其他字段，也可以在这里添加
}

const router = useRouter()
const cartItems = ref<CartItem[]>([]);

const fetchCartItems = async () => {
  try {
    const response = await getCartList()
    // cartItems.value = cloneDeep(response.data.data.items)
    cartItems.value = response.data.data.items.map((item:CartItem) => ({
      ...item,
      originalQuantity: item.quantity  // 保存商品的原始数量
    }))
    console.log(cartItems.value)
  } catch (error) {
    ElMessage.error('获取购物车列表失败')
  }
}

const updateQuantity = async (cartItemId: string, quantity: number) => {
  try {
    const response = await updateCartItem(cartItemId, quantity)
    console.log(response) // 打印看看 response 是什么
    if (response.data.code === '200') {
      await fetchCartItems()
      ElMessage.success('更新数量成功')
    } else {
      const updatedItem = cartItems.value.find(item => item.cartItemId === cartItemId);
      if (updatedItem) {
        updatedItem.quantity = updatedItem.originalQuantity;  // 恢复为原始数量
      }
      ElMessage.error('更新数量失败')
    }
  } catch (error) {
    ElMessage.error('网络或服务器错误')
  }
}


const removeItem = async (cartItemId: string) => {
  try {
    await removeCartItem(cartItemId)
    await fetchCartItems()
    ElMessage.success('删除商品成功')
  } catch (error) {
    ElMessage.error('删除商品失败')
  }
}
const goToCheckout = () => {
  router.push('/order')
}
const goBack = () => {
  router.push('/mainpage') // 返回上一页
}

onMounted(fetchCartItems)
</script>

<template>
  <div class="cart-container">
    <h1>购物车</h1>
    <el-table :data="cartItems" style="width: 100%">
      <el-table-column prop="title" label="商品名称"></el-table-column>
      <el-table-column prop="price" label="价格"></el-table-column>
      <el-table-column prop="quantity" label="数量">
        <template #default="{ row }">
          <el-input-number v-model="row.quantity"  @change="updateQuantity(row.cartItemId, $event)"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="danger" @click="removeItem(row.cartItemId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="cart-actions">
      <el-button type="primary" @click="goToCheckout">去结算</el-button>
      <el-button type="text" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  padding: 20px;
}
</style>