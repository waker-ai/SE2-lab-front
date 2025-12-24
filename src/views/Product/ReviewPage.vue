<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Back,
  Camera,
  EditPen,
  Picture as IconPicture
} from '@element-plus/icons-vue'
import { axios } from '../../utils/request'
import { API_MODULE } from '../../api/_prefix'

const route = useRoute()
const router = useRouter()

const rating = ref(0)
const comment = ref('')
const photoUrl = ref('')
const imageFileList = ref([])

const { orderId, productId } = route.query

// 图片上传逻辑保持不变
const handleUploadChange = async (file: any) => {
  try {
    // 本地预览优化：立即显示
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        photoUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    }

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

    photoUrl.value = `${signData.host}/${filename}`
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
    photoUrl.value = ''
    console.error('上传评论图片失败:', error)
  }
}

const handleSubmit = async () => {
  if (rating.value === 0) {
    ElMessage.warning('请先给出评分')
    return
  }

  const payload = {
    rating: rating.value,
    comment: comment.value,
    productId,
    orderId,
    photoUrl: photoUrl.value
  }

  try {
    await axios.post('/api/reviews', payload)
    ElMessage.success('评论提交成功')
    router.back()
  } catch (error) {
    console.error('提交评论失败', error)
    ElMessage.error('评论提交失败')
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="goBack" link class="back-link">
          <el-icon><Back /></el-icon> 返回订单
        </el-button>
        <div class="header-title">评价晒单</div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="content-wrapper">
      <el-card class="review-card" shadow="never">

        <!-- 评分区域 -->
        <div class="rating-section">
          <h3 class="section-title">您对商品满意吗？</h3>
          <div class="rating-wrapper">
            <el-rate
                v-model="rating"
                :max="5"
                show-score
                size="large"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :texts="['非常差', '差', '一般', '满意', '非常满意']"
                class="custom-rate"
            />
          </div>
        </div>

        <el-divider border-style="dashed" />

        <!-- 内容输入区域 -->
        <div class="input-section">
          <div class="label-row">
            <el-icon><EditPen /></el-icon>
            <span>分享您的使用体验</span>
          </div>
          <el-input
              v-model="comment"
              type="textarea"
              :rows="6"
              placeholder="商品质量如何？符合预期吗？快写下您的感受，帮助更多小伙伴吧~"
              maxlength="500"
              show-word-limit
              resize="none"
              class="review-input"
          />
        </div>

        <!-- 图片上传区域 -->
        <div class="upload-section">
          <div class="label-row">
            <el-icon><Camera /></el-icon>
            <span>晒图（可选）</span>
          </div>

          <div class="upload-area">
            <el-upload
                class="avatar-uploader"
                v-model:file-list="imageFileList"
                :on-change="handleUploadChange"
                :show-file-list="false"
                :http-request="() => {}"
                accept="image/*"
                :before-upload="(file: File) => file.type.startsWith('image/') || (ElMessage.error('只能上传图片'), false)"
            >
              <!-- 已有图片显示 -->
              <div v-if="photoUrl" class="image-preview">
                <el-image
                    :src="photoUrl"
                    fit="cover"
                    class="uploaded-img"
                />
                <div class="img-mask">
                  <el-icon><Camera /></el-icon>
                  <span>更换图片</span>
                </div>
              </div>

              <!-- 上传占位符 -->
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传</div>
              </div>
            </el-upload>

            <div class="upload-tip">
              <el-alert
                  title="支持 JPG/PNG 格式，展示商品细节更有说服力哦"
                  type="info"
                  :closable="false"
                  show-icon
              />
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="action-footer">
          <el-button size="large" @click="goBack" class="cancel-btn">取消</el-button>
          <el-button
              type="primary"
              size="large"
              @click="handleSubmit"
              class="submit-btn"
              :disabled="rating === 0"
          >
            提交评价
          </el-button>
        </div>

      </el-card>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --bg-color: #f5f7fa;
  --primary-color: #409eff;
  --text-main: #303133;
  --text-secondary: #909399;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 40px;
}

/* 顶部导航 */
.page-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  position: relative;
}

.back-link {
  font-size: 15px;
  color: #606266;
  position: absolute; /* 绝对定位，保证标题绝对居中 */
  left: 20px;
}
.back-link:hover {
  color: var(--primary-color);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 auto; /* 居中 */
}

/* 内容区域 */
.content-wrapper {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 20px;
}

.review-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  padding: 20px;
}

/* 评分区域 */
.rating-section {
  text-align: center;
  padding: 20px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20px;
}

.custom-rate {
  height: auto; /* 允许星星放大 */
}
/* 放大星星 */
:deep(.el-rate__icon) {
  font-size: 32px;
}
:deep(.el-rate__text) {
  font-size: 16px;
  margin-left: 12px;
}

/* 输入区域 */
.input-section {
  margin-bottom: 30px;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 12px;
}

.review-input :deep(.el-textarea__inner) {
  background-color: #f8f9fa;
  border-color: #eee;
  padding: 15px;
  font-size: 14px;
  border-radius: 8px;
}
.review-input :deep(.el-textarea__inner:focus) {
  background-color: #fff;
  border-color: var(--primary-color);
}

/* 上传区域 */
.upload-section {
  margin-bottom: 40px;
}

.upload-area {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  background-color: #fafafa;
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
}

/* 图片预览 */
.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.uploaded-img {
  width: 100%;
  height: 100%;
  display: block;
}

.img-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}
.image-preview:hover .img-mask {
  opacity: 1;
}

.upload-tip {
  flex: 1;
  min-width: 200px;
  margin-top: 10px;
}

/* 底部按钮 */
.action-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.submit-btn {
  width: 200px;
  font-weight: 600;
  letter-spacing: 1px;
}

.cancel-btn {
  width: 120px;
}

/* 响应式 */
@media (max-width: 600px) {
  .page-header {
    justify-content: center;
  }
  .back-link {
    position: static;
  }
  .header-content {
    justify-content: space-between;
  }

  .review-card {
    padding: 15px;
  }

  .submit-btn {
    width: 100%;
  }
  .cancel-btn {
    display: none; /* 手机端取消按钮可隐藏，用返回 */
  }
  .action-footer {
    flex-direction: column;
  }
}
</style>