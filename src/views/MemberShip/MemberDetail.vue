<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMember, Member } from '../../api/membership';
import { ElMessage } from 'element-plus';

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

onMounted(() => {
  fetchMemberInfo();
});
</script>

<template>
  <div class="member-detail">
    <el-card v-loading="loading">
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info p {
  margin: 10px 0;
}
</style>