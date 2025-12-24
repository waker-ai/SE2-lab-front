<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getMember, Member } from '../../api/membership';
import { ElMessage } from 'element-plus';
import {
  Back,
  User,
  Trophy,
  Timer,
  CircleCheck,
  CircleClose,
  Calendar
} from "@element-plus/icons-vue";
import { useRouter } from 'vue-router'
import dayjs from 'dayjs' // 建议引入dayjs处理日期，如果没有需确保项目已安装或用原生Date

const router = useRouter();
const member = ref<Member | null>(null);
const loading = ref(false);

const fetchMemberInfo = async () => {
  const username = sessionStorage.getItem('username');
  if (!username) {
    ElMessage.error('未找到登录用户信息');
    return;
  }

  try {
    loading.value = true;
    const response = await getMember(username);
    member.value = response.data.data;
  } catch (error) {
    console.error('获取会员信息失败:', error);
    ElMessage.error(`获取会员信息失败`);
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push(`/mainpage`)
}

// --- 计算属性与辅助逻辑 ---

// 计算剩余天数
const remainingDays = computed(() => {
  if (!member.value) return 0;
  const end = new Date(member.value.endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
})

// 计算时间进度百分比 (用于进度条)
const timeProgress = computed(() => {
  if (!member.value) return 0;
  const start = new Date(member.value.startDate).getTime();
  const end = new Date(member.value.endDate).getTime();
  const now = new Date().getTime();

  if (now > end) return 100;
  if (now < start) return 0;

  const total = end - start;
  const passed = now - start;
  return Math.min(100, Math.max(0, (passed / total) * 100));
})

// 根据等级返回卡片样式类
const levelClass = computed(() => {
  const level = member.value?.membershipLevel || '';
  return level.toLowerCase(); // bronze, silver, gold, platinum
})

// 等级中文映射
const levelText = computed(() => {
  const map: Record<string, string> = {
    'BRONZE': '青铜会员',
    'SILVER': '白银会员',
    'GOLD': '黄金会员',
    'PLATINUM': '铂金会员'
  };
  return map[member.value?.membershipLevel || ''] || member.value?.membershipLevel || '普通会员';
})

onMounted(() => {
  fetchMemberInfo();
});
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航栏 (整合返回按钮) -->
    <div class="page-header">
      <el-button @click="handleBack" link class="back-link">
        <el-icon><Back /></el-icon> 返回首页
      </el-button>
    </div>

    <div class="content-wrapper" v-loading="loading">

      <!-- 如果有数据 -->
      <template v-if="member">
        <!-- 1. 拟物化会员卡区域 -->
        <div class="card-section">
          <div class="vip-card" :class="levelClass">
            <div class="card-bg-texture"></div>
            <div class="card-top">
              <div class="card-logo">
                <el-icon><Trophy /></el-icon>
                <span>MEMBER CLUB</span>
              </div>
              <div class="card-level">{{ levelText }}</div>
            </div>

            <div class="card-middle">
              <div class="chip-icon"></div>
              <div class="wifi-icon">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div class="card-bottom">
              <div class="card-info-group">
                <span class="label">MEMBER NAME</span>
                <span class="value">{{ member.username }}</span>
              </div>
              <div class="card-info-group right">
                <span class="label">STATUS</span>
                <span class="value status-active" v-if="member.active">ACTIVE</span>
                <span class="value status-inactive" v-else>INACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 详细信息面板 -->
        <div class="info-panel">

          <!-- 有效期进度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span>会员有效期进程</span>
              <span class="days-left" v-if="member.active && remainingDays > 0">
                剩余 <strong>{{ remainingDays }}</strong> 天
              </span>
              <span class="days-left expired" v-else>已过期</span>
            </div>
            <el-progress
                :percentage="timeProgress"
                :stroke-width="12"
                striped
                striped-flow
                :color="member.active ? '#409eff' : '#909399'"
                :show-text="false"
            />
            <div class="dates-row">
              <div class="date-item">
                <el-icon><Calendar /></el-icon> 生效日: {{ member.startDate }}
              </div>
              <div class="date-item">
                <el-icon><Timer /></el-icon> 到期日: {{ member.endDate }}
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 详细属性列表 -->
          <el-descriptions title="账户详情" :column="2" border>
            <el-descriptions-item label="用户ID">
              <span class="mono-text">#{{ member.id }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="当前状态">
              <el-tag :type="member.active ? 'success' : 'danger'" effect="dark">
                <el-icon v-if="member.active"><CircleCheck /></el-icon>
                <el-icon v-else><CircleClose /></el-icon>
                {{ member.active ? '正常使用中' : '已冻结/失效' }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="会员特权">
              <div class="privilege-tags">
                <el-tag size="small" type="warning" effect="plain">专属折扣</el-tag>
                <el-tag size="small" type="warning" effect="plain">优先发货</el-tag>
                <el-tag size="small" type="warning" effect="plain">生日礼包</el-tag>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="续费建议">
              <span v-if="remainingDays < 7 && member.active" style="color: #f56c6c">即将到期，请及时续费</span>
              <span v-else style="color: #67c23a">状态良好</span>
            </el-descriptions-item>
          </el-descriptions>

        </div>
      </template>

      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="暂无会员信息，请先开通会员" />
    </div>
  </div>
</template>

<style scoped>
/* 基础变量 */
:root {
  --bg-color: #f0f2f5;
  --card-radius: 16px;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

/* 顶部导航 */
.page-header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-link {
  font-size: 15px;
  color: #606266;
}

/* 内容布局 */
.content-wrapper {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 20px;
}

/* --- 1. 会员卡样式 --- */
.card-section {
  display: flex;
  justify-content: center;
  margin-bottom: -40px; /* 让卡片下压一部分到下面的白色面板上，增加层次感 */
  position: relative;
  z-index: 2;
}

.vip-card {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1.586 / 1; /* 银行卡黄金比例 */
  border-radius: var(--card-radius);
  padding: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s;
}

.vip-card:hover {
  transform: translateY(-5px) scale(1.02);
}

/* 动态等级配色 */
.vip-card.bronze { background: linear-gradient(135deg, #a67c52 0%, #8a6240 100%); }
.vip-card.silver { background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%); }
.vip-card.gold   { background: linear-gradient(135deg, #f1c40f 0%, #b7892b 100%); }
.vip-card.platinum { background: linear-gradient(135deg, #373b44 0%, #4286f4 100%); }
/* 默认 */
.vip-card { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }

/* 卡片纹理装饰 */
.card-bg-texture {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%);
  pointer-events: none;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.card-level {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.card-middle {
  display: flex;
  align-items: center;
  gap: 15px;
}

.chip-icon {
  width: 45px;
  height: 35px;
  background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
  border-radius: 6px;
  position: relative;
  border: 1px solid rgba(0,0,0,0.1);
}
.chip-icon::after {
  content: ''; /* 模拟芯片纹路 */
  position: absolute;
  border: 1px solid rgba(0,0,0,0.2);
  top: 5px; left: 5px; right: 5px; bottom: 5px;
  border-radius: 4px;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-info-group {
  display: flex;
  flex-direction: column;
}

.card-info-group.right {
  align-items: flex-end;
}

.card-info-group .label {
  font-size: 10px;
  opacity: 0.7;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.card-info-group .value {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* --- 2. 详情面板样式 --- */
.info-panel {
  background: #fff;
  border-radius: var(--card-radius);
  padding: 60px 40px 40px 40px; /* 顶部留白给卡片 */
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.progress-section {
  margin-bottom: 30px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 500;
  color: #303133;
}

.days-left {
  font-size: 14px;
}
.days-left strong {
  color: #409eff;
  font-size: 18px;
  margin: 0 2px;
}
.days-left.expired {
  color: #f56c6c;
}

.dates-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}
.date-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mono-text {
  font-family: monospace;
  color: #606266;
}

.privilege-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 响应式 */
@media (max-width: 600px) {
  .vip-card {
    padding: 16px;
    border-radius: 12px;
  }
  .card-level {
    font-size: 16px;
  }
  .card-info-group .value {
    font-size: 14px;
  }
  .info-panel {
    padding: 50px 20px 20px 20px;
  }
}
</style>