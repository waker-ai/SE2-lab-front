<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  Address
} from '../../api/address.ts'

import { useRouter } from 'vue-router'

const router = useRouter()
const username = sessionStorage.getItem('username') || '';

console.log(username)
const addresses = ref<Address[]>([])
const showAddDialog = ref(false)
const editMode = ref(false)
const form = ref<Address>({})

const fetchAddresses = async () => {
    const res = await getAddresses(username)
    addresses.value = res.data.data
}

onMounted(fetchAddresses)

const goBack = () => router.push('/dashboard')

const setDefault = async (item: Address) => {
  await setDefaultAddress(item.id!, username)
  await fetchAddresses()
}

const deleteAddressById = async (id: number) => {
  try {
    await deleteAddress(id)
    await fetchAddresses()
    ElMessage.success('删除地址成功')
  } catch (error) {
    ElMessage.error('删除地址失败')
  }
}

const editAddress = (item: Address) => {
  form.value = { ...item }
  editMode.value = true
  showAddDialog.value = true
}

const submitForm = async () => {
  const phone = form.value.phone || ''
  const postalCode = form.value.postalCode || ''

  if (!/^\d{11}$/.test(phone)) {
    ElMessage.error('联系电话必须为11位数字')
    return
  }

  if (!/^\d{6}$/.test(postalCode)) {
    ElMessage.error('邮编必须为6位数字')
    return
  }

  try {
    if (editMode.value) {
      await updateAddress(form.value.id!, form.value)
      ElMessage.success('更新地址成功')
    } else {
      await addAddress({ ...form.value, username })
      ElMessage.success('添加地址成功')
    }
    showAddDialog.value = false
    form.value = {}
    editMode.value = false
    await fetchAddresses()
  } catch (error) {
    ElMessage.error(editMode.value ? '更新地址失败' : '添加地址失败')
  }
}
</script>

<template>
  <el-card class="address-manager-card">
    <!-- 返回按钮 -->
    <el-button type="text" @click="goBack" icon="ArrowLeft" style="margin-bottom: 20px">
      返回
    </el-button>

    <!-- 地址表单列表 -->
    <div class="address-list">
      <template v-if="addresses.length">
        <el-card
            v-for="item in addresses"
            :key="item.id"
            class="address-item"
            :body-style="{ padding: '20px' }"
        >
          <div class="address-info">
            <div>{{ item.addresseeName }}，{{ item.phone }}</div>
            <div>{{ item.deliveryAddress }}（邮编：{{ item.postalCode }}）</div>
            <div v-if="item.defaultAddress" style="color: green; font-weight: bold;">
              默认地址
            </div>
          </div>
          <div class="address-actions">
            <el-button @click="setDefault(item)" size="small">设为默认</el-button>
            <el-button @click="editAddress(item)" size="small">编辑</el-button>
            <el-button type="danger" @click="deleteAddressById(item.id!)" size="small">删除</el-button>
          </div>
        </el-card>
      </template>

      <!-- 空状态提示 -->
      <template v-else>
        <el-empty
            description="暂无收货地址"
            image-size="100"
            class="address-empty"
        />
      </template>
    </div>

    <!-- 操作按钮 -->
    <div class="address-buttons">
      <el-button type="primary" @click="showAddDialog = true">添加收货地址</el-button>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="showAddDialog" :title="editMode ? '编辑地址' : '添加地址'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="收件人">
          <el-input v-model="form.addresseeName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="11位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.deliveryAddress" />
        </el-form-item>
        <el-form-item label="邮编">
          <el-input v-model="form.postalCode" placeholder="6位邮政编码" maxlength="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.address-manager-card {
  width: 100%;
  padding: 40px;
  box-sizing: border-box;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 200px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.address-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.address-empty {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
