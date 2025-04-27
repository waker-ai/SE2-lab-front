<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Edit, Delete } from "@element-plus/icons-vue"
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getAdvertisements, deleteAdvertisement } from "../../api/advertisement.ts"

// 定义广告项类型
interface AdvertisementItem {
  id: number;
  title: string;
  content: string;
  imgUrl: string;
  productId: number;
}

const advertisements = ref<AdvertisementItem[]>([]) // ✅ 明确数组类型
const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 获取广告列表
const fetchAdvertisements = async () => {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    console.log('开始请求广告列表');
    const res = await getAdvertisements();
    console.log('广告列表请求响应:', res);
    advertisements.value = (res.data ?? []).map((ad: AdvertisementItem) => ({
      ...ad,
      imgUrl: ad.imgUrl ?? ''
    }));
  } catch (error) {
    ElMessage.error('获取广告列表失败');
    console.error('获取失败:', error);
  } finally {
    loadingInstance.close();
  }
};
// 跳转编辑页面
const handleEdit = (id: number) => {
  router.push(`/advertisement/edit?id=${id}`)
}

// 删除广告（带确认提示）
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该广告？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    await deleteAdvertisement(id)
    ElMessage.success('删除成功')
    await fetchAdvertisements()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(fetchAdvertisements)

// 路由变化时刷新
watch(() => route.path, (newPath) => {
  if (newPath === '/advertisement') {
    fetchAdvertisements()
  }
})
</script>

<template>
  <div class="p-4">
    <div class="header-actions">
      <el-button type="success" @click="router.push('/mainpage')">
        返回商品页面
      </el-button>
      <el-button type="primary" @click="router.push('/advertisement/edit')">
        新增广告
      </el-button>
    </div>

    <el-table :data="advertisements" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="content" label="内容" />
      <el-table-column label="图片">
        <template #default="{ row }">
          <el-image
              :src="row.imgUrl"
              fit="cover"
              style="width: 150px; height: 100px"
              :preview-src-list="[row.imgUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="productId" label="商品ID" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(row.id)"
          />
          <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="handleDelete(row.id)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.header-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.el-image {
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
</style>