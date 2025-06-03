<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { axios } from '../../utils/request'
import { API_MODULE } from '../../api/_prefix'

const route = useRoute()
const router = useRouter()

const rating = ref(0)
const comment = ref('')
const photoUrl = ref('')
const imageFileList = ref([])

const { orderId, productId } = route.query

const handleUploadChange = async (file: any) => {
  try {
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
  <div class="review-container">
    <h2 class="title">评价商品</h2>

    <div class="form-group">
      <label>评分：</label>
      <el-rate
          v-model="rating"
          :max="5"
          show-score
          :texts="['极差', '失望', '一般', '满意', '非常满意']"
          class="animated-stars"
      />
    </div>

    <div class="form-group">
      <label>评论内容：</label>
      <textarea v-model="comment" rows="4" class="comment-textarea" />
    </div>

    <div class="form-group">
      <label>上传照片：</label>
      <el-upload
          v-model:file-list="imageFileList"
          :on-change="handleUploadChange"
          :show-file-list="false"
          :http-request="() => {}"
          accept="image/*"
          :before-upload="(file: File) => {
          const isValid = file.type.startsWith('image/')
          if (!isValid) ElMessage.error('只能上传图片文件')
          return isValid
        }"
      >
        <el-button type="primary" plain>
          <el-icon><UploadFilled /></el-icon>
          上传图片
        </el-button>
      </el-upload>

      <el-image
          v-if="photoUrl"
          :src="photoUrl"
          fit="cover"
          class="preview-image"
      />
    </div>

    <div class="submit-group">
      <el-button type="primary" @click="handleSubmit">发布</el-button>
      <el-button @click="goBack">不填返回</el-button>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 80px;
  background: linear-gradient(to bottom right, #ffffff, #f7f9fc);
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
  transition: all 0.3s ease-in-out;
}

.review-container:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 35px;
  letter-spacing: 1px;
}

.form-group {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.rating-select,
.comment-textarea {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  transition: border-color 0.3s;
}

.comment-textarea:focus {
  border-color: #409EFF;
  outline: none;
}

.comment-textarea {
  resize: vertical;
}

.preview-image {
  margin-top: 12px;
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
}

.submit-group {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.submit-group .el-button {
  min-width: 120px;
  height: 42px;
  font-size: 16px;
  border-radius: 10px;
}

/* 星星动画 */
.animated-stars .el-rate__icon {
  transition: transform 0.2s ease, color 0.3s ease;
}
.animated-stars .el-rate__icon:hover {
  transform: scale(1.2);
  color: #FFD700;
}
</style>