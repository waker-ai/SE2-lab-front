<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAdvertisements, createAdvertisement, updateAdvertisement } from "../../api/advertisement.ts";
import { getProductList } from "../../api/product"; // 引入获取商品列表的 API
import { UploadFilled } from '@element-plus/icons-vue'
import { API_MODULE } from "../../api/_prefix.ts";

// 定义广告项的类型
interface AdvertisementItem {
  id: number;
  title: string;
  content: string;
  imgUrl: string;
  productId: string;
  // 可以根据实际情况添加更多属性
}

// 定义商品项的类型
interface ProductItem {
  id: number;
  // 可以根据实际情况添加更多属性
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
// 指定 products 的类型
const products = ref<ProductItem[]>([])

// 图片上传
const handleUploadChange = async (file: any) => {
  try {
    // 本地预览
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.imgUrl = e.target?.result as string // 临时预览
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

    // 设置封面 URL 为 OSS 上的地址
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
  // 显式指定 item 的类型
  const ad = res.data.find((item: AdvertisementItem) => item.id == id)
  if (ad) {
    form.value = { ...ad }
  }
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    const response = await getProductList()
    products.value = response.data.data as ProductItem[]
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

// 检查 productId 是否存在于商品列表中
const isProductIdValid = computed(() => {
  if (!form.value.productId) return false
  return products.value.some((product: ProductItem) => product.id.toString() === form.value.productId)
})

// 表单验证
const isValid = computed(() => {
  return (
      form.value.title.trim() !== '' &&
      form.value.content.trim() !== '' &&
      form.value.imgUrl !== '' &&
      isProductIdValid.value
  )
})

const save = async () => {
  if (!isValid.value) {
    if (!isProductIdValid.value) {
      ElMessage.error('输入的商品 ID 不存在，请重新输入。')
    } else {
      ElMessage.error('请填写完整信息')
    }
    return
  }
  if (id) {
    await updateAdvertisement({ ...form.value, productId: parseInt(form.value.productId)})
    ElMessage.success('更新成功')
  } else {
    await createAdvertisement(form.value)
    ElMessage.success('创建成功')
  }
  router.push('/advertisement')
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  if (id) {
    fetchDetail()
  }
  await fetchProducts() // 初始化时获取商品列表
})
</script>

<template>
  <div class="p-4">
    <el-page-header @back="goBack" content="广告编辑" />

    <el-form :model="form" label-width="80px" style="margin-top: 16px;">
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
            :before-upload="(file: File) => {
              // 直接返回判断结果，避免未使用变量
              if (!file.type.startsWith('image/')) {
                ElMessage.error('只能上传图片文件');
                return false;
              }
              return true;
            }"
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
      <el-form-item label="商品ID">
        <el-input v-model="form.productId" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :disabled="!isValid">保存</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>