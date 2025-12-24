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
import { ElMessage } from 'element-plus'
import {
  Back,
  Plus,
  User,
  Iphone,
  LocationInformation,
  Edit,
  Delete,
  Check
} from "@element-plus/icons-vue"

// 引入全局样式 (如果需要)
import '../../utils/global.css'

const router = useRouter()
const username = sessionStorage.getItem('username') || '';

const addresses = ref<Address[]>([])
const showAddDialog = ref(false)
const editMode = ref(false)
const form = ref<Address>({})

const fetchAddresses = async () => {
  try {
    const res = await getAddresses(username)
    addresses.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchAddresses)

const handleBack = () => router.push('/dashboard')

const setDefault = async (item: Address) => {
  if (item.defaultAddress) return // 已经是默认，无需操作
  await setDefaultAddress(item.id!, username)
  await fetchAddresses()
  ElMessage.success('已设为默认地址')
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

const openAddDialog = () => {
  form.value = {}
  editMode.value = false
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
  <div class="page-container">
    <div class="main-wrapper">

      <!-- 顶部导航与操作栏 -->
      <div class="header-section">
        <div class="header-left">
          <el-button @click="handleBack" circle plain class="back-btn">
            <el-icon><Back /></el-icon>
          </el-button>
          <h2 class="page-title">收货地址管理</h2>
        </div>
        <el-button type="primary" @click="openAddDialog" class="add-btn">
          <el-icon class="el-icon--left"><Plus /></el-icon>
          新增地址
        </el-button>
      </div>

      <!-- 地址列表区域 -->
      <div class="address-content">
        <!-- 有数据时显示 Grid -->
        <div v-if="addresses.length" class="address-grid">
          <div
              v-for="item in addresses"
              :key="item.id"
              :class="['address-card', { 'is-default': item.defaultAddress }]"
          >
            <!-- 默认地址标记 -->
            <div v-if="item.defaultAddress" class="default-badge">
              默认
            </div>

            <!-- 卡片主体内容 -->
            <div class="card-body">
              <div class="user-row">
                <span class="name">{{ item.addresseeName }}</span>
                <span class="phone">
                  <el-icon><Iphone /></el-icon> {{ item.phone }}
                </span>
              </div>

              <div class="divider"></div>

              <div class="address-detail">
                <el-icon class="addr-icon"><LocationInformation /></el-icon>
                <div class="addr-text">
                  <p>{{ item.deliveryAddress }}</p>
                  <span class="postal">邮编：{{ item.postalCode }}</span>
                </div>
              </div>
            </div>

            <!-- 卡片底部操作区 -->
            <div class="card-actions">
              <el-button
                  text
                  :type="item.defaultAddress ? 'info' : 'primary'"
                  size="small"
                  @click="setDefault(item)"
                  :disabled="!!item.defaultAddress"
              >
                {{ item.defaultAddress ? '当前默认' : '设为默认' }}
              </el-button>

              <div class="action-group">
                <el-button link type="primary" size="small" @click="editAddress(item)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button link type="danger" size="small" @click="deleteAddressById(item.id!)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
            v-else
            description="暂无收货地址，快去添加一个吧"
            class="address-empty"
        >
          <el-button type="primary" @click="openAddDialog">立即添加</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
        v-model="showAddDialog"
        :title="editMode ? '编辑收货地址' : '新增收货地址'"
        width="500px"
        align-center
        destroy-on-close
        class="custom-dialog"
    >
      <el-form :model="form" label-width="90px" status-icon>
        <el-form-item label="收件人">
          <el-input v-model="form.addresseeName" placeholder="请输入收件人姓名">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="11位手机号" maxlength="11">
            <template #prefix><el-icon><Iphone /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input
              v-model="form.deliveryAddress"
              type="textarea"
              :rows="2"
              placeholder="请输入街道、楼牌号等"
          />
        </el-form-item>
        <el-form-item label="邮政编码">
          <el-input v-model="form.postalCode" placeholder="6位邮政编码" maxlength="6" style="width: 150px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存地址</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 全局容器变量 */
:root {
  --primary-color: #409eff;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #303133;
  --text-secondary: #909399;
  --border-color: #ebeef5;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 30px;
  box-sizing: border-box;
}

.main-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.back-btn:hover {
  background-color: #e6e6e6;
  border-color: #dcdfe6;
}

.add-btn {
  padding: 10px 20px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
}

/* 列表区域 */
.address-content {
  min-height: 300px;
}

.address-grid {
  display: grid;
  /* 自适应列宽，最窄320px */
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
}

/* 卡片样式 */
.address-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.address-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

/* 默认地址高亮 */
.address-card.is-default {
  border: 1px solid var(--primary-color);
  background-color: #f0f9ff;
}

.default-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--primary-color);
  color: white;
  font-size: 12px;
  padding: 4px 12px;
  border-bottom-left-radius: 12px;
  font-weight: bold;
}

.card-body {
  padding: 24px 24px 16px;
  flex: 1;
}

.user-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.phone {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0 15px;
}

.address-detail {
  display: flex;
  gap: 10px;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.addr-icon {
  margin-top: 3px;
  color: #909399;
}

.addr-text p {
  margin: 0 0 6px 0;
  /* 限制显示3行 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.postal {
  font-size: 12px;
  color: #999;
}

/* 底部操作条 */
.card-actions {
  background: #fcfcfc;
  border-top: 1px solid #f0f0f0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 5px;
}

/* 空状态 */
.address-empty {
  background: white;
  border-radius: 12px;
  padding: 60px 0;
}

/* 弹窗底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }

  .address-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: row;
    align-items: center;
  }

  .page-title {
    font-size: 18px;
  }

  .add-btn span {
    display: none; /* 手机上只显示图标加号 */
  }
  .add-btn .el-icon {
    margin: 0 !important;
  }
}
</style>