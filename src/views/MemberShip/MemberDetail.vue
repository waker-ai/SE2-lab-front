<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMember, Member } from '../../api/membership';
import { ElMessage } from 'element-plus';
import {Back} from "@element-plus/icons-vue";
import { useRouter } from 'vue-router'

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
    console.log('Member response:', response.data);
    ElMessage.success('会员信息获取成功');
  } catch (error) {
    console.error('获取会员信息失败:', error);
    ElMessage.error(`获取会员信息失败: ${error}`);
  } finally {
    loading.value = false;
  }
};

// 返回处理
const handleBack = () => {
  router.push(`/mainpage`)
}

onMounted(() => {
  fetchMemberInfo();
});
</script>

<template>
  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class="back-button">
    <el-icon><Back /></el-icon>
  </el-button>

  <div class="member-detail">
    <el-card v-loading="loading" class="member-card">
      <template #header>
        <div class="card-header">
          <h2>会员信息</h2>
        </div>
      </template>
      <div v-if="member" class="member-info">
        <p><strong>用户名:</strong> {{ member.username }}</p>
        <p><strong>会员等级:</strong> {{ member.membershipLevel }}</p>
        <p><strong>开始日期:</strong> {{ member.startDate }}</p>
        <p><strong>结束日期:</strong> {{ member.endDate }}</p>
        <p><strong>是否激活:</strong> {{ member.active ? '是' : '否' }}</p>
      </div>
      <div v-else-if="!loading">
        <p>暂无会员信息</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.member-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; /* 页面垂直居中 */
  padding: 20px;
  background-color: #f5f7fa; /* 可选：淡背景 */
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.member-card {
  width: 100%;
  max-width: 900px; /* 设置最大宽度 */
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  transition: transform 0.3s;
}

.member-card:hover {
  transform: translateY(-5px);
}

.member-info p {
  font-size: 14px;
  color: #333;
  margin: 8px 0;
}
.back-button {
  position: fixed;         /* 固定在页面左上角 */
  top: 20px;
  left: 20px;
  z-index: 100;
  width: 42px;
  height: 42px;
  border: none;
  background: linear-gradient(to right, #00c6ff, #0072ff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  transition: all 0.25s ease;
}

.back-button:hover {
  transform: scale(1.1);
  background: linear-gradient(to right, #0072ff, #0051d4);
}

.back-button:focus {
  outline: none;
}

</style>