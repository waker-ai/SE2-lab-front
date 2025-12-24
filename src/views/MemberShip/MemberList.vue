<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getMemberList, Member } from '../../api/membership';
import { ElMessage } from 'element-plus';
import {
  Search,
  Refresh,
  User,
  Trophy,
  Timer
} from '@element-plus/icons-vue';

const members = ref<Member[]>([]);
const loading = ref(true);
const searchKeyword = ref('');

const fetchMembers = async () => {
  try {
    loading.value = true;
    const response = await getMemberList();
    members.value = response.data.data;
    // ElMessage.success('会员列表刷新成功'); // 可选：避免频繁提示
  } catch (error) {
    ElMessage.error(`获取会员列表失败`);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 前端过滤逻辑
const filteredMembers = computed(() => {
  if (!searchKeyword.value) return members.value;
  const keyword = searchKeyword.value.toLowerCase();
  return members.value.filter(m =>
      m.username.toLowerCase().includes(keyword) ||
      m.id.toString().includes(keyword)
  );
});

// 辅助函数：获取等级对应的 Tag 类型
const getLevelTagType = (level: string) => {
  const l = level.toUpperCase();
  if (l === 'PLATINUM') return 'danger'; // 红色/紫色
  if (l === 'GOLD') return 'warning';    // 金色
  if (l === 'SILVER') return 'info';     // 灰色
  return '';                             // 默认蓝色(青铜)
};

// 辅助函数：格式化等级文字
const formatLevel = (level: string) => {
  const map: Record<string, string> = {
    'BRONZE': '青铜会员',
    'SILVER': '白银会员',
    'GOLD': '黄金会员',
    'PLATINUM': '铂金会员'
  };
  return map[level] || level;
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">

      <!-- 头部：标题与操作区 -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">会员管理</h2>
          <span class="sub-title">共 {{ filteredMembers.length }} 位会员</span>
        </div>
        <div class="header-right">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名/ID"
              class="search-input"
              clearable
              :prefix-icon="Search"
          />
          <el-button :icon="Refresh" circle @click="fetchMembers" title="刷新列表" />
        </div>
      </div>

      <!-- 表格区域 -->
      <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
        <el-table
            :data="filteredMembers"
            style="width: 100%"
            v-loading="loading"
            stripe
            highlight-current-row
        >
          <!-- ID列 -->
          <el-table-column prop="id" label="ID" width="80" align="center" sortable />

          <!-- 用户名列 (带头像) -->
          <el-table-column label="用户信息" min-width="180">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="32" class="user-avatar" :icon="User" />
                <span class="username">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 会员等级列 -->
          <el-table-column prop="membershipLevel" label="会员等级" width="140" sortable>
            <template #default="{ row }">
              <el-tag
                  :type="getLevelTagType(row.membershipLevel)"
                  effect="plain"
                  round
                  class="level-tag"
              >
                <el-icon class="icon-spacer"><Trophy /></el-icon>
                {{ formatLevel(row.membershipLevel) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 有效期列 -->
          <el-table-column label="有效期范围" width="240">
            <template #default="{ row }">
              <div class="date-range">
                <span>{{ row.startDate }}</span>
                <span class="date-separator">至</span>
                <span>{{ row.endDate }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column prop="active" label="状态" width="120" align="center">
            <template #default="{ row }">
              <div class="status-badge" :class="{ 'active': row.active }">
                <span class="status-dot"></span>
                {{ row.active ? '已激活' : '未激活' }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --bg-color: #f5f7fa;
  --text-main: #303133;
  --text-secondary: #909399;
  --primary-color: #409eff;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  color: var(--text-main);
}

.sub-title {
  font-size: 13px;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 240px;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* 表格内部样式 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background-color: #e6f7ff;
  color: var(--primary-color);
}

.username {
  font-weight: 500;
  color: var(--text-main);
}

.level-tag {
  font-weight: 600;
  border: none;
}
.icon-spacer {
  margin-right: 4px;
}

.date-range {
  font-size: 13px;
  color: #606266;
  font-family: monospace; /* 等宽字体让日期对齐更好看 */
}

.date-separator {
  margin: 0 8px;
  color: #c0c4cc;
}

/* 状态指示器 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  background: #f4f4f5;
  padding: 4px 10px;
  border-radius: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #c0c4cc;
}

.status-badge.active {
  color: #67c23a;
  background: #f0f9eb;
}

.status-badge.active .status-dot {
  background-color: #67c23a;
}

/* 覆盖 Element 表头 */
:deep(.el-table th.el-table__cell) {
  background-color: #fafafa;
  color: var(--text-main);
  font-weight: 600;
}
</style>