<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getMemberList, Member } from '../../api/membership.ts'
import {createCoupon,CouponVO } from "../../api/coupon.ts";  // 从后端导入接口

const memberList = ref<Member[]>([])        // 存储会员列表
const selectedMembers = ref<Member[]>([])
const couponVO = ref<CouponVO>({
  discountAmount: 0,    // 数值类型默认0
  minCost: 0,
  validTime: 0,
  used: false
});

const isActiveMember = (member: Member): boolean => {
  const now = dayjs()
  return dayjs(member.startDate).isBefore(now) && dayjs(member.endDate).isAfter(now)
}

onMounted(() => {
  // 获取所有会员信息
  getMemberList()
      .then(res => {
        memberList.value = res.data.data.filter(isActiveMember)
      })
      .catch(err => {
        console.error('获取会员列表失败：', err)
      })
})

const validCouponData = (): string | null => {
  const { discountAmount, minCost, validTime } = couponVO.value

  if (selectedMembers.value.length === 0) {
    return '请至少选择一个会员'
  }
  if (discountAmount < 0 || minCost < 0 || validTime < 0) {
    return '折扣金额、最低消费和有效期不能小于0'
  }
  if (minCost < discountAmount) {
    return '最低消费金额必须大于等于折扣金额'
  }

  return null // 表示校验通过
}

// 处理复选框勾选状态变化
const handleCheckboxChange = (checked: boolean, member: Member) => {
  const index = selectedMembers.value.findIndex(m => m.id === member.id)
  if (checked && index === -1) {
    selectedMembers.value.push(member)
  } else if (!checked && index !== -1) {
    selectedMembers.value.splice(index, 1)
  }
}


// 发送优惠券给选中的会员
const sendCoupons = async () => {
  const errorMsg = validCouponData()
  if (errorMsg) {
    alert(errorMsg)
    return
  }

  try {
    await createCoupon({
      members: selectedMembers.value,
      couponVO: couponVO.value
    })
    alert('优惠券发放成功！')
    selectedMembers.value = []
    couponVO.value = {
      discountAmount: 0,
      minCost: 0,
      validTime: 0,
      used: false
    }
  } catch (err) {
    console.error(err)
    alert('发放失败，请稍后重试')
  }
}
</script>

<template>
  <el-table :data="memberList" style="width: 100%">
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="username" label="用户名" />
    <el-table-column label="会员等级">
      <template #default="{ row }">
        <div
            :class="['level-tag', row.membershipLevel?.toLowerCase()]"
        >
          {{
            row.membershipLevel === 'BRONZE' ? '青铜' :
                row.membershipLevel === 'SILVER' ? '白银' :
                    row.membershipLevel === 'GOLD' ? '黄金' :
                        row.membershipLevel === 'PLATINUM' ? '铂金' :
                            row.membershipLevel
          }}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="startDate" label="开始日期" />
    <el-table-column prop="endDate" label="到期日期" />
    <el-table-column label="会员状态" width="100">
      <template #default="{ row }">
        <div v-if="isActiveMember(row)" class="active-member-tag">会员</div>
      </template>
    </el-table-column>
    <el-table-column label="选择">
      <template #default="{ row }">
        <el-checkbox
            :model-value="selectedMembers.some(m => m.id === row.id)"
            @update:model-value="(checked: boolean) => handleCheckboxChange(checked, row)"
        />
      </template>
    </el-table-column>
  </el-table>
  <div>
    <!-- 优惠券信息表单 -->
    <div style="margin-bottom: 16px; margin-top: 100px">  <!-- 增加上方24px边距 -->
      <el-form label-width="100px" inline class="coupon-form">
        <el-form-item label="折扣金额">
          <el-input v-model.number="couponVO.discountAmount" type="number" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="最低消费">
          <el-input v-model.number="couponVO.minCost" type="number" placeholder="请输入最低消费" />
        </el-form-item>
        <el-form-item label="有效期（天）">
          <el-input v-model.number="couponVO.validTime" type="number" placeholder="请输入天数" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="sendCoupons">发放优惠券</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.active-member-tag {
  display: inline-block;
  padding: 2px 6px;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  border-radius: 4px;
  font-weight: 600;
  user-select: none;
}
:deep(.coupon-form .el-form-item__label) {
  font-size: 16px !important;
}

:deep(.coupon-form .el-input__inner) {
  font-size: 16px !important;
  height: 40px !important;
  line-height: 40px !important;
}

/* 调整输入框宽度 */
:deep(.coupon-form .el-input) {
  width: 220px;
}
:deep(.level-tag) {
  display: inline-block;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 4px;
  font-weight: 600;
  user-select: none;
}

:deep(.bronze) {
  color: #A0522D;
  border-color: #A0522D;
}

:deep(.silver) {
  color: #C0C0C0;
  border-color: #C0C0C0;
}

:deep(.gold) {
  color: #FFD700;
  border-color: #FFD700;
}

:deep(.platinum) {
  color: #20B2AA;
  border-color: #20B2AA;
}

</style>
