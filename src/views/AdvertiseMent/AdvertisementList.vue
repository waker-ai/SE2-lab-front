<script setup lang="ts">

import { ref, onMounted } from 'vue'
import {UploadFilled} from "@element-plus/icons-vue";
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {getAdvertisements,deleteAdvertisement} from "../../api/advertisement.ts";


const advertisements = ref([])
const router = useRouter()

const dropdownRef = ref()
const selectedAd = ref(null)
const confirmVisible = ref(false)
const loading=ref(false)
const imageFileList = ref([])

const handleUploadChange = async (file: any) => {
  try {
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.imageUrl = e.target?.result as string // 本地预览
      }
      reader.readAsDataURL(file.raw)
    }

    // 获取 OSS 签名
    const signRes = await fetch(`${API_MODULE}/oss/signature`)
    if (!signRes.ok) throw new Error('获取签名失败')
    const signData = await signRes.json()

    const filename = `${signData.dir}${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
    const formData = new FormData()
    formData.append('key', filename)
    formData.append('policy', signData.policy)
    formData.append('OSSAccessKeyId', signData.accessid)
    formData.append('signature', signData.signature)
    formData.append('success_action_status', '200')
    formData.append('file', file.raw)

    const ossRes = await fetch(signData.host, {
      method: 'POST',
      body: formData
    })
    if (ossRes.status !== 200) throw new Error('OSS 上传失败')

    // 上传成功，设置图片URL
    form.value.imageUrl = `${signData.host}/${filename}`
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
    form.value.imageUrl = ''
    console.error('上传错误:', error)
  }
}

const fetchAdvertisements = async () => {
  const res = await getAdvertisements()
  advertisements.value = res.data.data
}

const goToCreate = () => {
  router.push('/advertisement/edit')
}

const goToMainPage=()=>{
  router.push('/mainpage')
}

const handleRightClick = (row, column, event) => {
  event.preventDefault()
  selectedAd.value = row
  dropdownRef.value?.show(event)
}

const handleCommand = (command) => {
  if (command ==='delete') {
    confirmVisible.value = true
  }
}

const confirmDelete = async () => {
  try {
    loading.value = true
    await deleteAdvertisement(selectedAd.value.id)
    ElMessage.success('删除成功')
    confirmVisible.value = false
    fetchAdvertisements()
  } catch (e) {
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAdvertisements)

</script>

<template>
  <div class="p-4">
    <div style="margin-bottom: 16px;">
      <el-button type="primary" @click="goToCreate">新增广告</el-button>
      <el-button type="success" @click="goToMainPage" style="margin-left: 8px;">进入商城</el-button>
    </div>

    <el-table
        :data="advertisements"
        @row-contextmenu="handleRightClick"
        style="margin-top: 16px"
    >
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="imageUrl" label="图片">
        <el-upload
            v-model:file-list="imageFileList"
            :on-change="handleUploadChange"
            :show-file-list="false"
            :http-request="() => {}"
            accept="image/*"
            :before-upload="(file:File)=>{
      const isValid =file.type.startsWith('image/');
      if(!isValid) ElMessage.error('只能上传图片文件');
      return isValid;
    }"
        >
          <el-button type="primary" plain>
            <el-icon><upload-filled /></el-icon>
            上传图片
          </el-button>
        </el-upload>

        <el-image
            v-if="form.imageUrl"
            :src="form.imageUrl"
            fit="cover"
            style="width: 150px; margin-top: 10px"
        />
      </el-table-column>
      <el-table-column prop="productId" label="商品ID" />
    </el-table>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="confirmVisible" title="删除确认" width="30%">
      <span>确定要删除该广告吗？</span>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="danger"  :loading="loading" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 -->
    <el-dropdown
        ref="dropdownRef"
        trigger="manual"
        :hide-on-click="false"
        @command="handleCommand"
    >
      <div></div> <!-- 空容器 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="delete">删除广告</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 1rem;
}
</style>