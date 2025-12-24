<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCouponList, Coupon } from '../../api/coupon.ts'
import { userInfo } from '../../api/user.ts'
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Ticket,
  CircleCheck,
  Warning
} from "@element-plus/icons-vue";

const router = useRouter()
const coupons = ref<Coupon[]>([])
const selectedTab = ref('all') // 对应 el-tabs 的 name
const username = ref('')
const loading = ref(false)

const fetchCoupons = async () => {
  loading.value = true
  try {
    const userInfoRes = await userInfo()
    username.value = userInfoRes.data.data.username

    const res = await getCouponList(username.value)
    coupons.value = res.data.data || []
  } catch (err) {
    console.error('获取优惠券失败:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
}

const now = new Date()

// 辅助函数：判断优惠券状态
const getCouponStatus = (c: Coupon) => {
  if (c.used) return 'used'
  if (new Date(c.endDate) < now) return 'expired'
  return 'usable'
}

const filteredCoupons = computed(() => {
  if (selectedTab.value === 'all') return coupons.value

  return coupons.value.filter(c => {
    const status = getCouponStatus(c)
    if (selectedTab.value === 'usable') return status === 'usable'
    if (selectedTab.value === 'expired') return status === 'used' || status === 'expired'
    return true
  })
})

const handleBack = () => {
  router.back()
}

onMounted(fetchCoupons)
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" link class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <div class="page-title">我的优惠券</div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-wrapper">

      <!-- 标签页切换 -->
      <div class="tabs-container">
        <el-tabs v-model="selectedTab" class="custom-tabs">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="可使用" name="usable" />
          <el-tab-pane label="已失效" name="expired" />
        </el-tabs>
      </div>

      <!-- 优惠券列表 -->
      <div class="coupon-grid" v-loading="loading">
        <template v-if="filteredCoupons.length > 0">
          <div
              v-for="coupon in filteredCoupons"
              :key="coupon.id"
              class="coupon-card"
              :class="getCouponStatus(coupon)"
          >
            <!-- 左侧：金额区 -->
            <div class="coupon-left">
              <div class="amount-wrapper">
                <span class="symbol">￥</span>
                <span class="amount">{{ coupon.discountAmount }}</span>
              </div>
              <div class="condition">满 {{ coupon.minCost }} 可用</div>
            </div>

            <!-- 中间：分割线 -->
            <div class="coupon-divider"></div>

            <!-- 右侧：详情区 -->
            <div class="coupon-right">
              <div class="info-top">
                <div class="coupon-name">
                  <el-tag size="small" effect="plain" round class="type-tag">通用券</el-tag>
                  全场通用立减券
                </div>
                <div class="coupon-time">
                  有效期：{{ formatDate(coupon.startDate) }} - {{ formatDate(coupon.endDate) }}
                </div>
              </div>

              <!-- 状态印章/图标 -->
              <div class="status-icon">
                <el-icon v-if="getCouponStatus(coupon) === 'used'"><CircleCheck /></el-icon>
                <el-icon v-else-if="getCouponStatus(coupon) === 'expired'"><Warning /></el-icon>
                <div v-if="getCouponStatus(coupon) === 'usable'" class="use-btn">立即使用</div>
              </div>
            </div>

            <!-- 装饰圆角（模拟撕票口） -->
            <div class="hole top"></div>
            <div class="hole bottom"></div>
          </div>
        </template>

        <!-- 空状态 -->
        <el-empty
            v-else
            description="暂无相关优惠券"
            :image-size="120"
            class="empty-state"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #f56c6c; /* 优惠券红 */
  --bg-color: #f5f7fa;
  --text-main: #303133;
  --text-secondary: #909399;
  --disabled-bg: #c0c4cc;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.page-header {
  background: #fff;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.back-btn {
  font-size: 15px;
  color: #606266;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

/* 内容区 */
.content-wrapper {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* Tabs */
.tabs-container {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

/* Grid 布局 */
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

/* --- 优惠券卡片核心样式 --- */
.coupon-card {
  display: flex;
  height: 110px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

/* 左侧：金额 */
.coupon-left {
  width: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  flex-shrink: 0;
}

.coupon-card.usable .coupon-left {
  background: linear-gradient(135deg, #ff9a9e 0%, #f56c6c 100%);
}

.coupon-card.expired .coupon-left,
.coupon-card.used .coupon-left {
  background: #c8c9cc;
}

.amount-wrapper {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 16px;
  font-weight: 500;
}

.amount {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
}

.condition {
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.9;
}

/* 中间：分割线 */
.coupon-divider {
  width: 0;
  border-left: 2px dashed #e4e7ed;
  position: relative;
  z-index: 1;
  margin: 10px 0; /* 上下留白 */
}

/* 右侧：详情 */
.coupon-right {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.coupon-name {
  font-size: 15px;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-tag {
  border-color: currentColor;
}

.usable .type-tag { color: var(--primary-color); background-color: #fef0f0; }
.expired .type-tag, .used .type-tag { color: #909399; background-color: #f4f4f5; }

.coupon-time {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 状态标示 */
.status-icon {
  position: absolute;
  right: 15px;
  bottom: 10px;
}

.status-icon .el-icon {
  font-size: 50px;
  color: #ebeef5;
  transform: rotate(-15deg);
}

.use-btn {
  font-size: 12px;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 4px 12px;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.use-btn:hover {
  background: var(--primary-color);
  color: #fff;
}

/* 装饰圆孔 (模拟撕票口) */
.hole {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: var(--bg-color); /* 与页面背景色一致 */
  border-radius: 50%;
  left: 102px; /* 左侧宽度(110) - 半径(8) */
  z-index: 2;
}

.hole.top {
  top: -8px;
}

.hole.bottom {
  bottom: -8px;
}

/* 响应式适配 */
@media (max-width: 600px) {
  .page-header {
    padding: 0 15px;
  }
  .content-wrapper {
    padding: 15px;
  }
  .coupon-grid {
    grid-template-columns: 1fr; /* 手机端单列 */
  }

  .amount {
    font-size: 32px;
  }
}
</style>