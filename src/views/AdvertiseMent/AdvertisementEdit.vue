<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {getAdvertisements, createAdvertisement, updateAdvertisement} from "../../api/advertisement.js";

const route = useRoute()
const router = useRouter()
const form = ref({
  title: '',
  content: '',
  imageUrl: '',
  productId: ''
})

const id = route.query.id

const fetchDetail = async () => {
  const res = await getAdvertisements()
  const ad = res.data.data.find(item => item.id == id)
  if (ad) {
    form.value = { ...ad }
  }
}

const save = async () => {
  if (id) {
    await updateAdvertisement({ ...form.value, id })
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

onMounted(() => {
  if (id) {
    fetchDetail()
  }
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
      <el-form-item label="图片URL">
        <el-input v-model="form.imageUrl" />
      </el-form-item>
      <el-form-item label="商品ID">
        <el-input v-model="form.productId" />
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="save" style="margin-top: 16px;">保存</el-button>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 1rem;
}
</style>