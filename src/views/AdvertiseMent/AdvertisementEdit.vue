<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { getAdvertisements, createAdvertisement, updateAdvertisement } from "../../api/advertisement.ts";
import '../../utils/global.css'
import { Back, UploadFilled, Plus, Picture } from '@element-plus/icons-vue' // 引入新图标
import { API_MODULE } from "../../api/_prefix.ts";

// --- 保持原有接口和逻辑不变 ---
interface AdvertisementItem {
  id: number;
  title: string;
  content: string;
  imgUrl: string;
  productId: string;
}

const route = useRoute()
const router = useRouter()
const form = ref({
  title: '',
  content: '',
  imgUrl: '',
  productId: ''
})

const imageFileList = ref([])

const handleUploadChange = async (file: any) => {
  try {
    // 本地预览
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.imgUrl = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    }

    // 获取签名
    const signRes = await fetch(`${API_MODULE}/oss/signature`)
    if (!signRes.ok) {
      ElMessage.error('获取签名失败')
      return
    }
    const signData = await signRes.json()

    // 构建 OSS 上传参数
    const filename = `${signData.dir}${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
    const formData = new FormData()
    formData.append('key', filename)
    formData.append('policy', signData.policy)
    formData.append('OSSAccessKeyId', signData.accessid)
    formData.append('signature', signData.signature)
    formData.append('success_action_status', '200')
    formData.append('file', file.raw)

    // 上传到 OSS
    const ossRes = await fetch(signData.host, {
      method: 'POST',
      body: formData
    })
    if (ossRes.status !== 200) {
      ElMessage.error('OSS 上传失败')
      return
    }

    form.value.imgUrl = `${signData.host}/${filename}`
    ElMessage.success('封面上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
    form.value.imgUrl = ''
    console.error('上传错误:', error)
  }
}

const id = route.query.id ? Number(route.query.id) : undefined

const fetchDetail = async () => {
  try {
    const res = await getAdvertisements()
    const ad = res.data.find((item: AdvertisementItem) => item.id == id)
    if (ad) {
      form.value = { ...ad }
    }
  } catch (e) {
    console.error(e)
  }
}

const isValid = computed(() => {
  return (
      form.value.title.trim() !== '' &&
      form.value.content.trim() !== '' &&
      form.value.imgUrl !== ''
  )
})

const save = async () => {
  try {
    if (id) {
      await updateAdvertisement({ ...form.value, productId: parseInt(form.value.productId) })
      ElMessage.success('更新成功')
    } else {
      await createAdvertisement(form.value)
      ElMessage.success('创建成功')
    }
    router.push('/advertisement')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const handleBack = () => {
  router.push('/mainpage') // 或 router.back()
}

onMounted(async () => {
  if (id) {
    fetchDetail()
  }
})
</script>

<template>
  <div class="page-wrapper">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" link class="back-link">
          <el-icon class="back-icon"><Back /></el-icon>
          <span>返回</span>
        </el-button>
        <div class="divider-vertical"></div>
        <h1 class="page-title">{{ id ? '编辑广告' : '新增广告' }}</h1>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <el-card class="form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form :model="form" label-position="top" class="custom-form">
          <!-- 标题输入 -->
          <el-form-item label="广告标题" required>
            <el-input
                v-model="form.title"
                placeholder="请输入吸引人的广告标题"
                size="large"
            />
          </el-form-item>

          <!-- 内容输入 -->
          <el-form-item label="广告内容" required>
            <el-input
                v-model="form.content"
                type="textarea"
                :rows="5"
                placeholder="请输入广告详细描述..."
                resize="none"
            />
          </el-form-item>

          <!-- 图片上传 (优化版) -->
          <el-form-item label="广告封面图" required>
            <div class="upload-container">
              <el-upload
                  class="avatar-uploader"
                  v-model:file-list="imageFileList"
                  :on-change="handleUploadChange"
                  :show-file-list="false"
                  :http-request="() => {}"
                  accept="image/*"
                  :before-upload="(file: File) => file.type.startsWith('image/') || (ElMessage.error('只能上传图片文件'), false)"
              >
                <!-- 有图片时显示图片 -->
                <div v-if="form.imgUrl" class="image-preview-wrapper">
                  <el-image :src="form.imgUrl" fit="cover" class="uploaded-image" />
                  <div class="image-hover-mask">
                    <el-icon><UploadFilled /></el-icon>
                    <span>点击替换</span>
                  </div>
                </div>

                <!-- 无图片时显示上传占位符 -->
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">点击上传封面图</div>
                  <div class="upload-subtext">支持 JPG, PNG 格式</div>
                </div>
              </el-upload>
            </div>
          </el-form-item>

          <!-- 底部按钮组 -->
          <div class="form-actions">
            <el-button size="large" @click="handleBack">取消</el-button>
            <el-button
                type="primary"
                size="large"
                @click="save"
                :disabled="!isValid"
                class="save-btn"
            >
              保存更改
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409eff;
  --bg-color: #f5f7fa;
  --text-main: #303133;
  --text-secondary: #909399;
}

.page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.page-header {
  background: #fff;
  padding: 0 40px;
  height: 64px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-link {
  font-size: 16px;
  color: var(--text-secondary);
}
.back-link:hover {
  color: var(--primary-color);
}
.back-icon {
  margin-right: 4px;
}

.divider-vertical {
  height: 20px;
  width: 1px;
  background-color: #e4e7ed;
  margin: 0 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.form-card {
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  border: none;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.custom-form {
  padding: 10px 0;
}

/* 上传组件美化 */
.upload-container {
  width: 100%;
}

.avatar-uploader {
  width: 100%;
  display: block;
}

/* 必须穿透 element 样式使上传区域全宽 */
:deep(.el-upload) {
  width: 100%;
  display: block;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

:deep(.el-upload:hover) {
  border-color: var(--primary-color);
}

.upload-placeholder {
  height: 240px; /* 增加高度，适合广告图比例 */
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #c0c4cc;
}

.upload-text {
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-subtext {
  font-size: 12px;
  color: #c0c4cc;
}

/* 图片预览与遮罩 */
.image-preview-wrapper {
  width: 100%;
  height: 300px; /* 预览图高度 */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保证广告图完整显示 */
  display: block;
}

.image-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-wrapper:hover .image-hover-mask {
  opacity: 1;
}

/* 底部按钮 */
.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.save-btn {
  min-width: 120px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    padding: 0 20px;
  }

  .main-content {
    padding: 20px 10px;
  }

  .image-preview-wrapper,
  .upload-placeholder {
    height: 180px;
  }
}
</style>