<script setup lang="ts">
import { ref, computed, nextTick,onMounted } from 'vue';
import { charge, checkMember, getMembershipLevelPrice, MembershipLevel,getMember } from '../../api/membership';
import { ElMessage } from 'element-plus';

const username = sessionStorage.getItem('username') as string;
const isMember = ref(false);
const currentLevel = ref<MembershipLevel | null>(null);
const selectedLevel = ref<MembershipLevel>(MembershipLevel.BRONZE);
const months = ref(1);
const amount = computed(() => getMembershipLevelPrice(selectedLevel.value) * months.value);

const allMembershipLevels = Object.values(MembershipLevel);
const availableMembershipLevels = computed(() => {
  if (!isMember.value) {
    return allMembershipLevels;
  }
  const currentIndex = allMembershipLevels.indexOf(currentLevel.value as MembershipLevel);
  return allMembershipLevels.slice(currentIndex + 1);
});

const paymentForm = ref<string | null>(null);
onMounted(async () => {
  try {
    const response = await checkMember(username);
    isMember.value = response.data;
    if (isMember.value) {
      // 如果是会员，获取当前等级（这里需要添加一个新的 API 方法来获取当前会员等级）
      const member = await getMember(username);
       currentLevel.value = member.data.membershipLevel;

    }
    selectedLevel.value = isMember.value ? availableMembershipLevels.value[0] : MembershipLevel.BRONZE;
  } catch (error) {
    ElMessage.error('获取会员信息失败');
  }
});

const handleCharge = async () => {
  try {
    const chargeInfo = {
      username,
      months: months.value,
      amount: amount.value,
      membershipLevel: selectedLevel.value
    };
    const response = await charge(chargeInfo);
    if (response.data.code === '200') {
      paymentForm.value = response.data.data;
      // 使用 nextTick 确保 DOM 更新后再执行脚本
      nextTick(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.submit();
        }
      });
      ElMessage.success('充值表单生成成功，正在跳转到支付页面');
    } else {
      ElMessage.error(response.data.msg || '充值失败');
    }
  } catch (error) {
    ElMessage.error('充值失败');
  }
};
</script>

<template>
  <div class="member-charge">
    <h2>会员充值</h2>
    <el-form v-if="!paymentForm">
      <el-form-item label="用户名">
        <el-input v-model="username" disabled></el-input>
      </el-form-item>
      <el-form-item label="会员等级">
        <el-select v-model="selectedLevel">
          <el-option
              v-for="level in availableMembershipLevels"
              :key="level"
              :label="level"
              :value="level"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="充值月数">
        <el-input-number v-model="months" :min="1" :max="12"></el-input-number>
      </el-form-item>
      <el-form-item label="需要支付">
        <el-input :value="amount + '元'" disabled></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCharge">充值</el-button>
      </el-form-item>
    </el-form>
    <div v-else v-html="paymentForm" class="payment-form"></div>
  </div>
</template>

<style scoped>
.member-charge {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.payment-form {
  margin-top: 20px;
}
</style>