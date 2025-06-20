<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCouponList, Coupon } from '../../api/coupon.ts'
import { userInfo } from '../../api/user.ts'
import {Back} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";


const router = useRouter()
const coupons = ref<Coupon[]>([])
const selectedTab = ref('all') // 可用值：all, usable, expired
const username = ref('')

const fetchCoupons = async () => {
  try {
    // 获取当前用户信息
    const userInfoRes = await userInfo()
    username.value = userInfoRes.data.data.username
    console.log(username.value)
    // 传递 username 参数调用 getCouponList 函数
    const res = await getCouponList(username.value)
    console.log(res.data)
    coupons.value = res.data.data
    console.log(coupons.value)
  } catch (err) {
    console.error('获取优惠券失败:', err)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}
// 计算分类
const now = new Date()

const filteredCoupons = computed(() => {
  if (selectedTab.value === 'all') return coupons.value

  return coupons.value.filter(c => {
    const end = new Date(c.endDate)
    if (selectedTab.value === 'usable') return !c.used && end > now
    if (selectedTab.value === 'expired') return c.used || end <= now
    return true
  })
})

// 返回处理
const handleBack = () => {
  router.back()
}

onMounted(fetchCoupons)
</script>

<template>
  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class="back-button">
    <el-icon><Back /></el-icon>
  </el-button>
  <el-container style="padding: 20px">
    <el-aside width="200px" >
      <el-menu default-active="all" @select="selectedTab = $event">
        <el-menu-item index="all">全部</el-menu-item>
        <el-menu-item index="usable">可使用</el-menu-item>
        <el-menu-item index="expired">已过期/已使用</el-menu-item>
      </el-menu>
    </el-aside>

    <el-main>
      <el-row :gutter="20">
        <el-col v-for="coupon in filteredCoupons" :key="coupon.id" :span="24">
          <el-card shadow="hover" style="margin-right: 20px;">
            <div class="coupon-title">
              满 {{ coupon.minCost }} 减 {{ coupon.discountAmount }}
            </div>
            <div class="coupon-date">
              有效期：{{ formatDate(coupon.startDate) }} ~ {{ formatDate(coupon.endDate) }}
            </div>
            <div>
              状态：
              <el-tag :type="coupon.used || new Date(coupon.endDate) < now ? 'info' : 'success'">
                {{ coupon.used ? '已使用' : (new Date(coupon.endDate) < now ? '已过期' : '可使用') }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.coupon-title {
  font-size: 20px;
  font-weight: bold;
}

.coupon-date {
  font-size: 12px;
  color: #666;
}
</style>