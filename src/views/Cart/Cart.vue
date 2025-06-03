
<script setup lang="ts">
import { ref, onMounted,computed ,watch} from 'vue'
import { getCartList, updateCartItem, removeCartItem } from '../../api/cart'
import { ElMessage } from 'element-plus'
import {useRouter} from "vue-router";
// import { cloneDeep } from 'lodash-es'
import { getAvailableCoupons,applyCoupon, Coupon } from '../../api/coupon.ts'
import { getDefaultAddress,getAddresses, Address } from '../../api/address.ts'
const username = sessionStorage.getItem('username') || ''

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
const goToCheckout = async () =>{
  if (selectedCoupon.value) {
    try {
      await applyCoupon(selectedCoupon.value) // 调用后端接口标记为已使用
      ElMessage.success('优惠券已应用')
    } catch (e) {
      ElMessage.error('优惠券应用失败')
      return // 失败就不跳转了
    }
  }

  // 成功后跳转并传递金额信息
  router.push('/order')
}
const goBack = () => {
  router.push('/mainpage') // 返回上一页
}

// onMounted(fetchCartItems)

//优惠卷
const availableCoupons = ref<Coupon[]>([])
const selectedCouponId = ref<number | null>(null)


const fetchAvailableCoupons = async () => {
  try {
    const res = await getAvailableCoupons(username)
    availableCoupons.value = res.data.data
  } catch (e) {
    ElMessage.error('获取优惠券失败')
  }
}

const filteredCoupons = computed(() =>
    availableCoupons.value.filter(coupon => totalAmount.value >= coupon.minCost)
)

const totalAmount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const selectedCoupon = computed(() =>
    availableCoupons.value.find(c => c.id === selectedCouponId.value) || null
)

const discountAmount = computed(() =>
    selectedCoupon.value && totalAmount.value >= selectedCoupon.value.minCost
        ? selectedCoupon.value.discountAmount
        : 0
)

const finalAmount = computed(() =>
    Math.max(totalAmount.value - discountAmount.value, 0)
)
//地址
const defaultAddress = ref<Address | null>(null)
const allAddresses = ref<Address[]>([])
const showAddressDialog = ref(false)
const selectedAddressId = ref<number | null>(null)


const fetchDefaultAddress = async () => {
  try {
    const res = await getDefaultAddress(username)
    defaultAddress.value = res.data.data
  } catch (e) {
    ElMessage.error('获取默认地址失败')
  }
}

const fetchAllAddresses = async () => {
  try {
    const res = await getAddresses(username)
    allAddresses.value = res.data.data
  } catch (e) {
    ElMessage.error('获取地址列表失败')
  }
}

const selectAddress = (id: number) => {
  selectedAddressId.value = id
  const selected = allAddresses.value.find(addr => addr.id === id) || null
  if (selected) {
    defaultAddress.value = selected
  }
  showAddressDialog.value = false
}
watch(selectedAddressId, (newVal) => {
  if (newVal !== null) {
    selectAddress(newVal)
  }
})

onMounted(async () => {
  await fetchCartItems()
  await fetchAvailableCoupons()
  await fetchDefaultAddress()
  await fetchAllAddresses()
})
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
    <!-- 优惠券选择器 -->
    <div style="margin: 20px 0;">
      <el-form label-width="80px">
        <el-form-item label="优惠券">
          <el-select v-model="selectedCouponId" placeholder="请选择优惠券" style="width: 300px">
            <el-option
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                :label="`满${coupon.minCost}减${coupon.discountAmount}`"
                :value="coupon.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>


    <!-- 金额汇总区域 -->
    <div style="margin: 10px 0; font-weight: bold;">
      <div>商品总金额：￥{{ totalAmount.toFixed(2) }}</div>
      <div v-if="discountAmount > 0">优惠金额：-￥{{ discountAmount.toFixed(2) }}</div>
      <div>应付金额：<span style="color: red;">￥{{ finalAmount.toFixed(2) }}</span></div>
    </div>

    <el-card shadow="hover" class="address-card" @click="showAddressDialog = true">
      <template #header>
        <strong>收货地址</strong>
      </template>
      <div v-if="defaultAddress">
        <p>{{ defaultAddress.addresseeName }}，{{ defaultAddress.phone }}</p>
        <p>{{ defaultAddress.deliveryAddress }}，{{ defaultAddress.postalCode }}</p>
      </div>
      <div v-else>暂无默认地址，请添加</div>
    </el-card>

    <!-- 地址选择弹窗 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="500px">
      <el-radio-group v-model="selectedAddressId" class="w-full">
        <el-radio
            v-for="address in allAddresses"
            :key="address.id"
            :label="address.id"
            class="address-option"
        >
          <p>{{ address.addresseeName }}，{{ address.phone }}</p>
          <p>{{ address.deliveryAddress }}，{{ address.postalCode }}</p>
        </el-radio>
      </el-radio-group>
    </el-dialog>

    <div class="cart-actions">
      <el-button type="primary" @click="goToCheckout">提交订单</el-button>
      <el-button type="text" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  padding: 20px;
}
.address-card {
  margin-bottom: 20px;
  cursor: pointer;
  border: 2px solid #dcdfe6;
  transition: border-color 0.3s;
  max-width: 400px;   /* 限制最大宽度 */
  padding: 10px 15px; /* 减小内边距 */
  font-size: 14px;    /* 调小字体 */
  line-height: 1.4;   /* 行高稍微紧凑点 */
}
.address-card:hover {
  border-color: #409EFF;
}
.address-option {
  margin-bottom: 12px;
  padding: 10px 15px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  transition: all 0.2s;
  height: 80px; /* 固定高度 */
  width: 100%;  /* 宽度撑满父容器 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  white-space: normal; /* 允许换行 */
  word-break: break-word;
  box-sizing: border-box; /* 包含 padding */
}

.address-option:hover {
  border-color: #409EFF;
  background-color: #f5f7fa;
}

</style>
```

