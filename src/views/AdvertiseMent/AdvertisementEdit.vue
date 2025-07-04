<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAdvertisements, createAdvertisement, updateAdvertisement } from "../../api/advertisement.ts";
import '../../utils/global.css'
import {Back, UploadFilled} from '@element-plus/icons-vue'
import { API_MODULE } from "../../api/_prefix.ts";

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
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.imgUrl = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    }

    const signRes = await fetch(`${API_MODULE}/oss/signature`)
    if (!signRes.ok) {
      ElMessage.error('获取签名失败')
      return
    }
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
  const res = await getAdvertisements()
  const ad = res.data.find((item: AdvertisementItem) => item.id == id)
  if (ad) {
    form.value = { ...ad }
  }
}

// const fetchProducts = async () => {
//   try {
//     const response = await getProductList()
//     products.value = response.data.data as ProductItem[]
//   } catch (error) {
//     console.error('获取商品列表失败:', error)
//   }
// }
//
// const isProductIdValid = computed(() => {
//   if (!form.value.productId) return false
//   return products.value.some(product => product.id.toString() === form.value.productId)
// })

const isValid = computed(() => {
  return (
      form.value.title.trim() !== '' &&
      form.value.content.trim() !== '' &&
      form.value.imgUrl !== ''
      // isProductIdValid.value
  )
})

const save = async () => {
  if (id) {
    await updateAdvertisement({ ...form.value, productId: parseInt(form.value.productId) })
    ElMessage.success('更新成功')
  } else {
    await createAdvertisement(form.value)
    ElMessage.success('创建成功')
  }
  router.push('/advertisement')
}

const handleBack = () => {
  router.push('/mainpage')
}

onMounted(async () => {
  if (id) {
    fetchDetail()
  }
})
</script>

<template>
  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class="back-button">
    <el-icon><Back /></el-icon>
  </el-button>

  <div class="advertisement-edit-panel">
    <h2 class="page-title">{{ id ? '编辑广告' : '新增广告' }}</h2>
    <hr class="section-divider" />

    <el-form :model="form" label-width="80px" class="form-container">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="form.content" type="textarea" />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
            v-model:file-list="imageFileList"
            :on-change="handleUploadChange"
            :show-file-list="false"
            :http-request="() => {}"
            accept="image/*"
            :before-upload="(file: File) => file.type.startsWith('image/') || (ElMessage.error('只能上传图片文件'), false)"
        >
          <el-button type="primary" plain>
            <el-icon><UploadFilled /></el-icon>
            上传图片
          </el-button>
        </el-upload>
        <el-image
            v-if="form.imgUrl"
            :src="form.imgUrl"
            fit="cover"
            style="width: 150px; margin-top: 10px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :disabled="!isValid">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.advertisement-edit-panel {
  padding: 40px 60px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.section-divider {
  border: none;
  border-bottom: 1px solid #ddd;
  margin-bottom: 24px;
}

.form-container {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
