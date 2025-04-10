<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Back } from '@element-plus/icons-vue'
import { createProduct } from '../../api/product'
import {API_MODULE} from "../../api/_prefix.ts";


const router = useRouter()
//const id = Number(router.currentRoute.value.params.storeId)

// 基础信息
const name = ref('')
const category = ref('')
const price = ref(0)
const coverUrl = ref('')
const description = ref('')

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
        coverUrl.value = e.target?.result as string // 临时预览
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

    // 设置封面 URL 为 OSS 上的地址
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
    description: description.value,
    cover: coverUrl.value,
    detail:description.value,
    specifications: specifications.value.map(spec => ({
      item: spec.item,
      value: spec.value,
      productId:""
    }))
  }

  try {
    const res = await createProduct(payload)
    if (res.data.code === '200') {
      ElMessage.success('商品创建成功')
      //router.push(`/mainpage`)
    }
  } catch (error:any) {
    ElMessage.error(error.response?.data?.msg || '创建失败')
  }
}

// 返回处理
const handleBack = () => {
  router.push(`/mainpage`)
}
</script>

<template>
  <el-main>
    <!-- 返回按钮 -->
    <el-button @click="handleBack" type="primary" circle plain>
      <el-icon><Back /></el-icon>
    </el-button>

    <!-- 页面标题 -->
    <h1 class="create-product-title">新建图书商品</h1>

    <!-- 表单容器 -->
    <el-form label-position="left" label-width="100px" class="create-product-form">
      <!-- 基础信息 -->
      <el-card shadow="never" class="form-section">
        <template #header>
          <span>基础信息</span>
        </template>

        <el-form-item label="书名" required>
          <el-input v-model="name" placeholder="请输入书名" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="category" placeholder="请选择分类" style="width: 100%">
            <el-option label="文学" value="LITERATURE" />
            <el-option label="科技" value="TECH" />
            <el-option label="儿童" value="CHILDREN" />
            <el-option label="艺术" value="ART" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" required>
          <el-input-number v-model="price" :min="0.01" :step="0.1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="封面" required>
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
              <el-icon><UploadFilled /></el-icon>
              上传封面
            </el-button>
          </el-upload>
          <el-image
              v-if="coverUrl"
              :src="coverUrl"
              fit="cover"
              style="width: 150px; margin-top: 10px"
          />
        </el-form-item>

        <el-form-item label="简介">
          <el-input
              v-model="description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品简介"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 规格信息 -->
      <el-card shadow="never" class="form-section">
        <template #header>
          <span>规格信息</span>
        </template>

        <div v-for="(spec, index) in specifications" :key="index" class="spec-item">
          <el-row :gutter="10">
            <el-col :span="10">
              <el-input v-model="spec.item" placeholder="属性名" :disabled="['作者','ISBN','出版社'].includes(spec.item)" />
            </el-col>
            <el-col :span="14">
              <el-input v-model="spec.value" :placeholder="`请输入${spec.item}`" />
            </el-col>
          </el-row>
        </div>

        <el-button
            type="text"
            @click="specifications.push({ item: '', value: '' })"
            style="margin-top: 10px"
        >
          + 添加自定义规格
        </el-button>
      </el-card>

      <!-- 操作按钮 -->
      <el-form-item class="form-actions">
        <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!isValid"
        >
          创建商品
        </el-button>
        <el-button @click="handleBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-main>
</template>

<style scoped>
.create-product-title {
  margin: 20px 0 30px 25%;
}

.create-product-form {
  margin-left: 25%;
  width: 50%;
}

.form-section {
  margin-bottom: 20px;
}

.spec-item {
  margin-bottom: 15px;
}

.form-actions {
  margin-top: 30px;
}
</style>