<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMemberList, Member } from '../../api/membership';
import { ElMessage } from 'element-plus';

const members = ref<Member[]>([]);
const loading = ref(true);

const fetchMembers = async () => {
  try {
    loading.value = true;
    const response = await getMemberList();
    console.log(response.data);
    members.value = response.data.data;
    ElMessage.success('会员列表获取成功');
  } catch (error) {
    ElMessage.error(`获取会员列表失败: ${error}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <div class="member-list">
    <h2>会员列表</h2>
    <el-table :data="members" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="membershipLevel" label="会员等级" width="120" />
      <el-table-column prop="startDate" label="开始日期" width="180" />
      <el-table-column prop="endDate" label="结束日期" width="180" />
      <el-table-column prop="active" label="是否激活" width="100">
        <template #default="scope">
          {{ scope.row.active ? '是' : '否' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.member-list {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}
</style>