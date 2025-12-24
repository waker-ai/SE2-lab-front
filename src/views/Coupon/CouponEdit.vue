<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { getMemberList, Member } from '../../api/membership.ts'
import { createCoupon, CouponVO } from "../../api/coupon.ts"
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import {
  User,
  Trophy,
  Calendar,
  Money,
  Timer,
  Present,
  Check,
  Search
} from '@element-plus/icons-vue'

const memberList = ref<Member[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const selectedMembers = ref<Member[]>([])
const loading = ref(false)
const searchKeyword = ref('') // 增加前端搜索过滤（纯UI优化）

const couponVO = ref<CouponVO>({
  discountAmount: undefined, // 改为undefined以便显示placeholder
  minCost: undefined,
  validTime: undefined,
  used: false
});

const isActiveMember = (member: Member): boolean => {
  const now = dayjs()
  return dayjs(member.startDate).isBefore(now) && dayjs(member.endDate).isAfter(now)
}

// 过滤后的列表（用于前端搜索展示）
const filteredMemberList = computed(() => {
  if (!searchKeyword.value) return memberList.value
  return memberList.value.filter(item =>
      item.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.id.toString().includes(searchKeyword.value)
  )
})

onMounted(() => {
  loading.value = true
  getMemberList()
      .then(res => {
        memberList.value = res.data.data.filter(isActiveMember)
      })
      .catch(err => {
        console.error('获取会员列表失败：', err)
        ElMessage.error('获取会员列表失败')
      })
      .finally(() => {
        loading.value = false
      })
})

// 使用 Element Table 的 selection-change 事件替代手动 checkbox
const handleSelectionChange = (val: Member[]) => {
  selectedMembers.value = val
}

const validCouponData = (): string | null => {
  const { discountAmount, minCost, validTime } = couponVO.value

  if (selectedMembers.value.length === 0) {
    return '请至少在左侧列表选择一名会员'
  }
  if (!discountAmount || !minCost || !validTime) {
    return '请完整填写优惠券配置信息'
  }
  if (discountAmount < 0 || minCost < 0 || validTime < 0) {
    return '数值不能小于 0'
  }
  if (minCost < discountAmount) {
    return '最低消费金额不能小于折扣金额'
  }

  return null
}

const sendCoupons = async () => {
  const errorMsg = validCouponData()
  if (errorMsg) {
    ElMessage.warning(errorMsg)
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定要向已选的 ${selectedMembers.value.length} 位会员发放优惠券吗？`,
        '确认发放',
        {
          confirmButtonText: '确定发放',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await createCoupon({
      members: selectedMembers.value,
      couponVO: couponVO.value as CouponVO
    })

    ElMessage.success('优惠券发放成功！')

    // 重置表单但保留列表（或根据需求清空选择）
    multipleTableRef.value!.clearSelection()
    couponVO.value = {
      discountAmount: undefined,
      minCost: undefined,
      validTime: undefined,
      used: false
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('发放失败，请稍后重试')
    }
  }
}

// 获取等级对应的样式类
const getLevelTagType = (level?: string) => {
  switch (level) {
    case 'BRONZE': return 'info'
    case 'SILVER': return '' // default
    case 'GOLD': return 'warning'
    case 'PLATINUM': return 'success'
    default: return 'info'
  }
}

const formatLevel = (level?: string) => {
  const map: Record<string, string> = {
    'BRONZE': '青铜会员',
    'SILVER': '白银会员',
    'GOLD': '黄金会员',
    'PLATINUM': '铂金会员'
  }
  return map[level || ''] || level || '普通会员'
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">

      <!-- 左侧：会员列表区域 -->
      <div class="main-section">
        <div class="section-header">
          <div class="header-title">
            <el-icon><User /></el-icon>
            <span>会员列表</span>
            <span class="badge">{{ filteredMemberList.length }}</span>
          </div>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名或ID..."
              prefix-icon="Search"
              clearable
              class="search-input"
          />
        </div>

        <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
          <el-table
              ref="multipleTableRef"
              :data="filteredMemberList"
              style="width: 100%"
              height="calc(100vh - 180px)"
              v-loading="loading"
              @selection-change="handleSelectionChange"
              row-key="id"
          >
            <!-- 使用 type="selection" 开启原生多选/全选功能 -->
            <el-table-column type="selection" width="55" align="center" />

            <el-table-column prop="id" label="ID" width="80" align="center" sortable />

            <el-table-column prop="username" label="用户名" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="username-text">{{ row.username }}</span>
              </template>
            </el-table-column>

            <el-table-column label="会员等级" width="120">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.membershipLevel)" effect="light" size="small" class="level-badge">
                  {{ formatLevel(row.membershipLevel) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="有效期" width="220">
              <template #default="{ row }">
                <div class="date-range">
                  <span>{{ row.startDate }}</span>
                  <el-icon class="date-arrow"><Calendar /></el-icon>
                  <span>{{ row.endDate }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <div class="status-indicator active" v-if="isActiveMember(row)">
                  <span class="dot"></span>
                  <span>生效中</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 右侧：操作面板 (Sticky) -->
      <div class="sidebar-section">
        <div class="sticky-wrapper">
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span><el-icon><Present /></el-icon> 优惠券配置</span>
              </div>
            </template>

            <el-form label-position="top" class="coupon-form">
              <el-form-item label="折扣金额">
                <el-input
                    v-model.number="couponVO.discountAmount"
                    type="number"
                    placeholder="0.00"
                >
                  <template #prefix>￥</template>
                </el-input>
              </el-form-item>

              <el-form-item label="最低消费门槛">
                <el-input
                    v-model.number="couponVO.minCost"
                    type="number"
                    placeholder="0.00"
                >
                  <template #prefix>￥</template>
                </el-input>
              </el-form-item>

              <el-form-item label="有效期时长">
                <el-input
                    v-model.number="couponVO.validTime"
                    type="number"
                    placeholder="例如: 30"
                >
                  <template #prefix><el-icon><Timer /></el-icon></template>
                  <template #append>天</template>
                </el-input>
              </el-form-item>

              <div class="summary-box">
                <div class="summary-item">
                  <span>已选人数</span>
                  <span class="highlight">{{ selectedMembers.length }}</span>
                </div>
                <div class="summary-desc" v-if="selectedMembers.length > 0">
                  即将为 {{ selectedMembers.length }} 位会员发放优惠券
                </div>
                <div class="summary-desc placeholder" v-else>
                  请在左侧列表选择发放对象
                </div>
              </div>

              <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  @click="sendCoupons"
                  :disabled="selectedMembers.length === 0"
              >
                立即发放
              </el-button>
            </el-form>
          </el-card>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 全局布局变量 */
:root {
  --bg-color: #f5f7fa;
  --primary-color: #409eff;
  --text-main: #303133;
  --text-secondary: #909399;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24px;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧主要区域 */
.main-section {
  flex: 1;
  min-width: 0; /* 防止flex子元素溢出 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background-color: #e6f7ff;
  color: var(--primary-color);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.search-input {
  width: 240px;
}

.table-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.username-text {
  font-weight: 500;
  color: var(--text-main);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.date-arrow {
  font-size: 12px;
  color: #c0c4cc;
}

/* 状态指示器 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-indicator.active {
  color: #67c23a;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* 右侧侧边栏 */
.sidebar-section {
  width: 340px;
  flex-shrink: 0;
}

.sticky-wrapper {
  position: sticky;
  top: 24px;
}

.action-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 表单样式 */
.coupon-form :deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 4px;
}

.summary-box {
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
}

.summary-item {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.highlight {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-left: 8px;
}

.summary-desc {
  font-size: 12px;
  color: var(--text-main);
}

.summary-desc.placeholder {
  color: #c0c4cc;
}

.submit-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 会员等级标签颜色定制 */
.level-badge {
  font-weight: bold;
}
</style>