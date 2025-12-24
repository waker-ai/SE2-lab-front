<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { getCartList, updateCartItem, removeCartItem } from '../../api/cart'
import { ElMessage, ElMessageBox } from 'element-plus' // 引入 ElMessageBox
import { useRouter } from "vue-router";
import { getAvailableCoupons, applyCoupon, Coupon } from '../../api/coupon.ts'
import { getDefaultAddress, getAddresses, Address } from '../../api/address.ts'
import { initiatePayment, submitOrder } from "../../api/order.ts";
import {
  Back,
  Delete,
  ShoppingTrolley,
  LocationInformation,
  Ticket,
  Money,
  Picture as IconPicture
} from "@element-plus/icons-vue";

const username = sessionStorage.getItem('username') || ''

// 扩展接口以支持图片显示 (假设API返回数据包含cover)
interface CartItem {
  cartItemId: string;
  title: string;
  price: number;
  quantity: number;
  originalQuantity: number;
  cover?: string; // 新增可选属性，用于展示图片
}

const shippingAddressId = ref<number | null>(null)
const cartItemIds = ref<string[]>([])
const paymentMethod = ref('ALIPAY')
const paymentForm = ref<string | null>(null)
const router = useRouter()
const cartItems = ref<CartItem[]>([]);
const loading = ref(false) // 增加加载状态

// --- 核心逻辑保持不变 ---

const fetchCartItems = async () => {
  loading.value = true
  try {
    const response = await getCartList()
    cartItems.value = response.data.data.items.map((item: any) => ({
      ...item,
      originalQuantity: item.quantity
    }))
  } catch (error) {
    ElMessage.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (cartItemId: string, quantity: number | undefined) => {
  if (quantity === undefined) return;
  try {
    const response = await updateCartItem(cartItemId, quantity)
    if (response.data.code === '200') {
      // 局部更新，不刷新整个列表以提升体验
      const item = cartItems.value.find(i => i.cartItemId === cartItemId)
      if (item) item.originalQuantity = quantity
      ElMessage.success('更新数量成功')
    } else {
      const updatedItem = cartItems.value.find(item => item.cartItemId === cartItemId);
      if (updatedItem) {
        updatedItem.quantity = updatedItem.originalQuantity;
      }
      ElMessage.error('更新数量失败')
    }
  } catch (error) {
    ElMessage.error('网络或服务器错误')
  }
}

const removeItem = async (cartItemId: string) => {
  try {
    await ElMessageBox.confirm('确定要移出该商品吗？', '提示', { type: 'warning' })
    await removeCartItem(cartItemId)
    await fetchCartItems()
    ElMessage.success('删除商品成功')
  } catch (error) {
    if(error !== 'cancel') ElMessage.error('删除商品失败')
  }
}

const handleBack = () => {
  router.push('/mainpage')
}

// 优惠券逻辑
const availableCoupons = ref<Coupon[]>([])
const selectedCouponId = ref<number | null>(null)

const fetchAvailableCoupons = async () => {
  try {
    const res = await getAvailableCoupons(username)
    availableCoupons.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

const totalAmount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const filteredCoupons = computed(() =>
    availableCoupons.value.filter(coupon => totalAmount.value >= coupon.minCost)
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

// 地址逻辑
const defaultAddress = ref<Address | null>(null)
const allAddresses = ref<Address[]>([])
const showAddressDialog = ref(false)
const selectedAddressId = ref<number | null>(null)

const fetchDefaultAddress = async () => {
  try {
    const res = await getDefaultAddress(username)
    defaultAddress.value = res.data.data
    if (defaultAddress.value) {
      shippingAddressId.value = defaultAddress.value.id ?? null;
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchAllAddresses = async () => {
  try {
    const res = await getAddresses(username)
    allAddresses.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

const selectAddress = (id: number) => {
  selectedAddressId.value = id
  const selected = allAddresses.value.find(addr => addr.id === id) || null
  if (selected) {
    defaultAddress.value = selected
    shippingAddressId.value = selected.id ?? null;
  }
  showAddressDialog.value = false
}

watch(selectedAddressId, (newVal) => {
  if (newVal !== null) {
    selectAddress(newVal)
  }
})

const fetchCartItemsToOrder = async () => {
  try {
    const response = await getCartList()
    const cartData = response.data.data
    cartItemIds.value = cartData.items.map((item: any) => item.cartItemId)
  } catch (error) {
    console.error(error)
  }
}

const submitOrderAndPay = async () => {
  if (!shippingAddressId.value) {
    ElMessage.warning('请先选择收货地址')
    return
  }

  if(selectedCoupon.value) {
    try {
      await applyCoupon(selectedCoupon.value)
    } catch (e) {
      ElMessage.error('优惠券应用失败')
      return
    }
  }

  try {
    const orderResponse = await submitOrder({
      cartItemIds: cartItemIds.value,
      shippingAddressId: shippingAddressId.value,
      selectedCouponId: selectedCouponId.value,
      paymentMethod: paymentMethod.value
    })

    const orderId = orderResponse.data.data.orderId

    try {
      const paymentResponse = await initiatePayment(orderId);
      if (paymentResponse.data.data.paymentForm) {
        paymentForm.value = paymentResponse.data.data.paymentForm;
      } else {
        throw new Error("支付表单数据为空");
      }
    } catch (error) {
      ElMessage.error("支付初始化失败，请重试");
    }

    nextTick(() => {
      if (paymentForm.value) {
        const formElement = document.createElement('div');
        formElement.innerHTML = paymentForm.value;
        document.body.appendChild(formElement);
        const form = formElement.querySelector('form');
        if (form) form.submit();
      }
    });

    ElMessage.success('订单提交成功，正在跳转支付...')
  } catch (error) {
    ElMessage.error('订单提交失败')
  }
}

onMounted(async () => {
  await fetchCartItems()
  await fetchCartItemsToOrder()
  await fetchAvailableCoupons()
  await fetchDefaultAddress()
  await fetchAllAddresses()
})
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="handleBack" link class="back-link">
          <el-icon><Back /></el-icon> 返回首页
        </el-button>
        <div class="header-title">
          <el-icon class="cart-icon"><ShoppingTrolley /></el-icon>
          我的购物车 <span>({{ cartItems.length }})</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="cart-layout-container" v-loading="loading">

      <!-- 空状态 -->
      <el-empty
          v-if="cartItems.length === 0 && !loading"
          description="购物车空空如也，快去选购吧"
          :image-size="200"
      >
        <el-button type="primary" @click="handleBack">去逛逛</el-button>
      </el-empty>

      <!-- 购物车有数据 -->
      <div v-else class="cart-grid">
        <!-- 左侧：商品列表 -->
        <div class="cart-main">
          <el-card shadow="never" class="cart-table-card" :body-style="{ padding: '0' }">
            <el-table
                :data="cartItems"
                style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
            >
              <!-- 商品信息列 -->
              <el-table-column label="商品信息" min-width="300">
                <template #default="{ row }">
                  <div class="product-info">
                    <el-image
                        :src="row.cover"
                        class="product-img"
                        fit="cover"
                    >
                      <template #error>
                        <div class="image-slot"><el-icon><IconPicture /></el-icon></div>
                      </template>
                    </el-image>
                    <div class="product-detail">
                      <div class="product-title" :title="row.title">{{ row.title }}</div>
                      <!-- 如果有规格属性可以在这里加 -->
                    </div>
                  </div>
                </template>
              </el-table-column>

              <!-- 价格列 -->
              <el-table-column label="单价" width="120" align="center">
                <template #default="{ row }">
                  <span class="price-text">￥{{ row.price.toFixed(2) }}</span>
                </template>
              </el-table-column>

              <!-- 数量列 -->
              <el-table-column label="数量" width="180" align="center">
                <template #default="{ row }">
                  <el-input-number
                      v-model="row.quantity"
                      :min="1"
                      :max="99"
                      size="small"
                      @change="updateQuantity(row.cartItemId, $event)"
                  />
                </template>
              </el-table-column>

              <!-- 小计列 -->
              <el-table-column label="小计" width="120" align="center">
                <template #default="{ row }">
                  <span class="subtotal-text">￥{{ (row.price * row.quantity).toFixed(2) }}</span>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button
                      link
                      type="danger"
                      :icon="Delete"
                      @click="removeItem(row.cartItemId)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 右侧：结算面板 (Sticky) -->
        <div class="cart-sidebar">
          <div class="sticky-wrapper">

            <!-- 地址卡片 -->
            <el-card class="sidebar-card address-section" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span><el-icon><LocationInformation /></el-icon> 收货地址</span>
                  <el-button link type="primary" size="small" @click="showAddressDialog = true">
                    {{ defaultAddress ? '切换' : '添加' }}
                  </el-button>
                </div>
              </template>

              <div v-if="defaultAddress" class="current-address">
                <div class="addr-user">{{ defaultAddress.addresseeName }} <span class="addr-phone">{{ defaultAddress.phone }}</span></div>
                <div class="addr-detail">{{ defaultAddress.deliveryAddress }}</div>
              </div>
              <div v-else class="no-address" @click="showAddressDialog = true">
                请选择收货地址
              </div>
            </el-card>

            <!-- 结算卡片 -->
            <el-card class="sidebar-card summary-card" shadow="always">
              <!-- 优惠券 -->
              <div class="coupon-section">
                <div class="section-label"><el-icon><Ticket /></el-icon> 优惠券</div>
                <el-select
                    v-model="selectedCouponId"
                    placeholder="选择优惠券"
                    clearable
                    class="coupon-select"
                >
                  <el-option
                      v-for="coupon in filteredCoupons"
                      :key="coupon.id"
                      :label="`省￥${coupon.discountAmount} (满${coupon.minCost}可用)`"
                      :value="coupon.id"
                  />
                </el-select>
              </div>

              <el-divider style="margin: 16px 0;" />

              <!-- 金额明细 -->
              <div class="summary-row">
                <span>商品总额</span>
                <span class="value">￥{{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="summary-row discount">
                <span>优惠立减</span>
                <span class="value">- ￥{{ discountAmount.toFixed(2) }}</span>
              </div>

              <el-divider style="margin: 16px 0;" />

              <div class="summary-total">
                <span>应付总额</span>
                <span class="total-price">
                  <span class="currency">￥</span>{{ finalAmount.toFixed(2) }}
                </span>
              </div>

              <el-button
                  type="primary"
                  class="checkout-btn"
                  size="large"
                  @click="submitOrderAndPay"
              >
                立即结算
              </el-button>
            </el-card>

          </div>
        </div>
      </div>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="500px" align-center>
      <el-scrollbar max-height="400px">
        <div class="address-list">
          <div
              v-for="address in allAddresses"
              :key="address.id"
              :class="['address-item', { active: selectedAddressId === address.id }]"
              @click="selectAddress(address.id!)"
          >
            <div class="address-check">
              <div class="check-circle"></div>
            </div>
            <div class="address-info">
              <div class="info-row">
                <span class="name">{{ address.addresseeName }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <div class="detail">{{ address.deliveryAddress }} ({{ address.postalCode }})</div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <template #footer>
        <el-button @click="router.push('/address')">管理地址</el-button>
        <el-button @click="showAddressDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #f56c6c; /* 电商常用红色 */
  --bg-color: #f5f7fa;
  --text-main: #303133;
  --text-secondary: #909399;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

/* 顶部 Header */
.page-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.back-link {
  font-size: 14px;
  color: #606266;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-icon {
  font-size: 20px;
}

/* 布局网格 */
.cart-layout-container {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.cart-grid {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.cart-main {
  flex: 1; /* 占据剩余空间 */
  min-width: 0;
}

.cart-sidebar {
  width: 340px; /* 固定宽度侧边栏 */
  flex-shrink: 0;
}

/* 侧边栏吸顶 */
.sticky-wrapper {
  position: sticky;
  top: 88px; /* Header高度 + 间距 */
}

/* 商品表格样式 */
.cart-table-card {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.product-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  background: #f9f9f9;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slot {
  font-size: 24px;
  color: #dcdfe6;
}

.product-title {
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.4;
  /* 显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-text {
  font-weight: bold;
}

.subtotal-text {
  color: var(--primary-color);
  font-weight: bold;
}

/* 侧边栏卡片 */
.sidebar-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
}

/* 地址部分 */
.address-section {
  cursor: pointer;
  transition: transform 0.2s;
}
.address-section:hover {
  transform: translateY(-2px);
}

.current-address {
  font-size: 14px;
  color: #333;
}

.addr-user {
  font-weight: bold;
  margin-bottom: 4px;
}

.addr-phone {
  font-weight: normal;
  color: #666;
  margin-left: 8px;
}

.addr-detail {
  color: #666;
  line-height: 1.4;
}

.no-address {
  color: #909399;
  font-style: italic;
  padding: 10px 0;
}

/* 结算明细 */
.summary-card {
  background: #fff;
}

.section-label {
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.coupon-select {
  width: 100%;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.summary-row.discount .value {
  color: #67c23a; /* 绿色表示优惠 */
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.summary-total span:first-child {
  font-size: 14px;
  font-weight: bold;
  position: relative;
  top: -4px;
}

.total-price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.currency {
  font-size: 16px;
  margin-right: 2px;
}

.checkout-btn {
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f56c6c 0%, #e64242 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
  transition: all 0.3s;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 108, 108, 0.4);
}

/* 弹窗地址列表 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;
}

.address-item {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all 0.2s;
}

.address-item:hover {
  border-color: #b3d8ff;
  background-color: #ecf5ff;
}

.address-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.address-check {
  padding-top: 4px;
}

.check-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  background: #fff;
}

.active .check-circle {
  border-color: #409eff;
  background: #409eff;
  position: relative;
}

.active .check-circle::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}

.info-row {
  margin-bottom: 4px;
}
.name {
  font-weight: bold;
  font-size: 16px;
}
.phone {
  margin-left: 10px;
  color: #666;
}
.detail {
  font-size: 13px;
  color: #999;
}

/* 响应式 */
@media (max-width: 992px) {
  .cart-grid {
    flex-direction: column;
  }
  .cart-sidebar {
    width: 100%;
  }
  .sticky-wrapper {
    position: static;
  }
}
</style>