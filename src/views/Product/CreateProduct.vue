<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  Back,
  Plus,
  Delete,
  Document,
  Picture,
  Coin,
  Notebook
} from '@element-plus/icons-vue'
import { createProduct, adjustStock } from '../../api/product'
import { API_MODULE } from "../../api/_prefix.ts";

const router = useRouter()

// 基础信息
const name = ref('')
const category = ref('')
const price = ref(0)
const coverUrl = ref('')
const description = ref('')
const stockAmount = ref(0)

// 规格信息
const specifications = ref([
  { item: '作者', value: '' },
  { item: 'ISBN', value: '' },
  { item: '出版社', value: '' },
  { item: '出版日期', value: '' },
  { item: '装帧', value: '' },
  { item: '页数', value: '' }
])

// 图片上传
const imageFileList = ref([])
const handleUploadChange = async (file: any) => {
  try {
    // 本地预览
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        coverUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    }

    // 获取签名
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

    coverUrl.value = `${signData.host}/${filename}`
    ElMessage.success('封面上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
    coverUrl.value = ''
    console.error('上传错误:', error)
  }
}

// 表单验证
const isValid = computed(() => {
  return (
      name.value.trim() !== '' &&
      category.value.trim() !== '' &&
      price.value > 0 &&
      coverUrl.value !== '' &&
      stockAmount.value >= 0 &&
      specifications.value.every(spec =>
          ['作者', 'ISBN', '出版社'].includes(spec.item)
              ? spec.value.trim() !== ''
              : true
      )
  )
})

// 提交处理
const handleSubmit = async () => {
  const payload = {
    title: name.value,
    price: price.value,
    category: category.value,
    description: description.value,
    cover: coverUrl.value,
    detail: description.value,
    stockAmount: stockAmount.value,
    specifications: specifications.value.map(spec => ({
      item: spec.item,
      value: spec.value,
      productId: ""
    }))
  }

  try {
    const res = await createProduct(payload)
    if (res.data.code !== '200') {
      throw new Error('商品创建失败')
    }
    const productId = res.data.data.id;
    if(stockAmount.value > 0)
      await adjustStock(productId, stockAmount.value)
    ElMessage.success('商品创建成功')
    router.push('/mainpage')
  } catch (error:any) {
    ElMessage.error(error.response?.data?.msg || '创建失败')
  }
}

const handleBack = () => {
  router.push(`/mainpage`)
}

// 移除规格
const removeSpec = (index: number) => {
  specifications.value.splice(index, 1)
}
</script>

<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" link class="back-link">
          <el-icon><Back /></el-icon> 返回
        </el-button>
        <div class="divider-vertical"></div>
        <h2 class="page-title">新建图书商品</h2>
      </div>
      <div class="header-right">
        <el-button @click="handleBack">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="!isValid">
          立即创建
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <el-form label-position="top" class="product-form">

        <div class="form-grid">
          <!-- 左侧主要信息 -->
          <div class="main-column">

            <!-- 基础信息卡片 -->
            <el-card shadow="never" class="form-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Document /></el-icon> 基础信息
                </div>
              </template>

              <el-form-item label="图书名称" required>
                <el-input
                    v-model="name"
                    placeholder="请输入完整书名"
                    size="large"
                    maxlength="100"
                    show-word-limit
                />
              </el-form-item>

              <el-form-item label="图书简介">
                <el-input
                    v-model="description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入内容简介，突出卖点..."
                    maxlength="500"
                    show-word-limit
                    resize="none"
                />
              </el-form-item>
            </el-card>

            <!-- 规格参数卡片 -->
            <el-card shadow="never" class="form-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Notebook /></el-icon> 规格参数
                </div>
              </template>

              <div class="specs-container">
                <div v-for="(spec, index) in specifications" :key="index" class="spec-row">
                  <el-input
                      v-model="spec.item"
                      placeholder="属性名"
                      :disabled="['作者','ISBN','出版社'].includes(spec.item)"
                      class="spec-key"
                  />
                  <div class="spec-separator">:</div>
                  <el-input
                      v-model="spec.value"
                      :placeholder="`请输入${spec.item}`"
                      class="spec-value"
                  />
                  <el-button
                      v-if="!['作者','ISBN','出版社'].includes(spec.item)"
                      type="danger"
                      link
                      :icon="Delete"
                      @click="removeSpec(index)"
                  />
                  <div v-else style="width: 32px"></div> <!-- 占位保持对齐 -->
                </div>
              </div>

              <el-button
                  type="primary"
                  link
                  :icon="Plus"
                  @click="specifications.push({ item: '', value: '' })"
                  class="add-spec-btn"
              >
                添加自定义规格
              </el-button>
            </el-card>
          </div>

          <!-- 右侧配置信息 -->
          <div class="side-column">

            <!-- 销售信息 -->
            <el-card shadow="never" class="form-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Coin /></el-icon> 销售信息
                </div>
              </template>

              <el-form-item label="商品分类" required>
                <el-select v-model="category" placeholder="选择分类" style="width: 100%">
                  <el-option label="文学" value="LITERATURE" />
                  <el-option label="科技" value="TECH" />
                  <el-option label="儿童" value="CHILDREN" />
                  <el-option label="艺术" value="ART" />
                </el-select>
              </el-form-item>

              <el-row :gutter="12">
                <el-col :span="12">
                  <el-form-item label="销售价格" required>
                    <el-input-number
                        v-model="price"
                        :min="0.01"
                        :precision="2"
                        :step="1"
                        controls-position="right"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="初始库存" required>
                    <el-input-number
                        v-model="stockAmount"
                        :min="0"
                        :step="10"
                        controls-position="right"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>

            <!-- 图片上传 -->
            <el-card shadow="never" class="form-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Picture /></el-icon> 商品封面
                </div>
              </template>

              <div class="upload-wrapper">
                <el-upload
                    class="cover-uploader"
                    v-model:file-list="imageFileList"
                    :on-change="handleUploadChange"
                    :show-file-list="false"
                    :http-request="() => {}"
                    accept="image/*"
                    :before-upload="(file:File)=>file.type.startsWith('image/') || (ElMessage.error('只能上传图片'), false)"
                >
                  <div v-if="coverUrl" class="cover-preview">
                    <img :src="coverUrl" class="cover-image" />
                    <div class="cover-mask">
                      <el-icon><UploadFilled /></el-icon>
                      <span>更换封面</span>
                    </div>
                  </div>
                  <div v-else class="uploader-icon">
                    <el-icon><Plus /></el-icon>
                    <span>上传封面</span>
                  </div>
                </el-upload>
                <div class="upload-tip">建议尺寸 800x800，支持 JPG/PNG</div>
              </div>
            </el-card>

          </div>
        </div>
      </el-form>
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
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.page-header {
  height: 64px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-link {
  font-size: 15px;
  color: var(--text-secondary);
}
.back-link:hover {
  color: var(--primary-color);
}

.divider-vertical {
  height: 16px;
  width: 1px;
  background: #dcdfe6;
  margin: 0 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

/* 内容区域 */
.content-wrapper {
  max-width: 1200px;
  margin: 24px auto;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 表单布局 */
.form-grid {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.main-column {
  flex: 1; /* 占据剩余空间 */
  min-width: 0;
}

.side-column {
  width: 360px; /* 右侧固定宽度 */
  flex-shrink: 0;
}

.form-card {
  border-radius: 8px;
  border: none;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.card-header {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

/* 规格行样式 */
.specs-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.spec-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spec-key {
  width: 140px;
  flex-shrink: 0;
}

.spec-separator {
  font-weight: bold;
  color: #909399;
}

.spec-value {
  flex: 1;
}

.add-spec-btn {
  padding-left: 0;
}

/* 图片上传美化 */
.upload-wrapper {
  text-align: center;
}

.cover-uploader {
  width: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  background-color: #fafafa;
}

.cover-uploader:hover {
  border-color: var(--primary-color);
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  height: 240px; /* 固定高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.uploader-icon span {
  font-size: 14px;
}

.cover-preview {
  width: 100%;
  height: 240px;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.cover-mask {
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
}

.cover-preview:hover .cover-mask {
  opacity: 1;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .form-grid {
    flex-direction: column-reverse; /* 手机端把重要信息放上面，或按需调整 */
  }
  .side-column {
    width: 100%;
  }
}
</style>