<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {Edit, Delete, Back} from "@element-plus/icons-vue"
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getAdvertisements, deleteAdvertisement } from "../../api/advertisement.ts"
import { ArrowLeft, CirclePlus } from '@element-plus/icons-vue'
import '../../utils/global.css'

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

// 返回处理
const handleBack = () => {
  router.push(`/mainpage`)
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
  <!-- 返回按钮 -->
  <el-button @click="handleBack" type="primary" circle class="back-button">
    <el-icon><Back /></el-icon>
  </el-button>

  <div class="advertisement-panel">
    <h2 class="page-title">广告管理中心</h2>
    <hr class="section-divider" />

    <div class="button-group">
      <el-button class="action-button secondary" :icon="ArrowLeft" @click="router.push('/mainpage')">
        返回
      </el-button>
      <el-button class="action-button primary" :icon="CirclePlus" @click="router.push('/advertisement/edit')">
        新增广告
      </el-button>
    </div>

    <div class="ad-list">
      <div class="ad-card" v-for="ad in advertisements" :key="ad.id">
        <div class="ad-card-left">
          <img :src="ad.imgUrl" alt="广告图" class="ad-image" />
        </div>
        <div class="ad-card-right">
          <div class="ad-info">
            <h3 class="ad-title">{{ ad.title }}</h3>
            <p class="ad-content">{{ ad.content }}</p>
          </div>
          <div class="ad-actions">
            <el-button circle :icon="Edit" @click="handleEdit(ad.id)" />
            <el-button circle type="danger" :icon="Delete" @click="handleDelete(ad.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advertisement-panel {
  padding: 40px 60px;
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
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

.button-group {
  display: flex;
  gap: 16px;
  margin-bottom: 36px; /* 🚨 加大间距，防止 hover 时遮挡按钮 */
  z-index: 2;
  position: relative;
}
.header-actions {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.action-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}


.action-button.primary {
  background: linear-gradient(to right, #4CAF50, #66BB6A);
  color: white;
}
.action-button.primary:hover {
  background: linear-gradient(to right, #43A047, #4CAF50);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.4);
}

.action-button.secondary {
  background-color: #e0e7f0;
  color: #374151;
}
.action-button.secondary:hover {
  background-color: #d4dce6;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.ad-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 24px;
}

.ad-card {
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  padding: 20px;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ad-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.ad-card-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-image {
  width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #f0f0f0;
}

.ad-card-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ad-info {
  margin-bottom: 12px;
}

.ad-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #222;
}

.ad-content {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.5;
}

.ad-product-id {
  font-size: 13px;
  color: #999;
}

.ad-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

