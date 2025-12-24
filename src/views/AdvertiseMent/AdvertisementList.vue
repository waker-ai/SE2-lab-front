<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus' // 补充 ElMessageBox
import {
  Edit,
  Delete,
  Plus,
  ArrowLeft,
  Picture as IconPicture
} from "@element-plus/icons-vue"
import { getAdvertisements, deleteAdvertisement } from "../../api/advertisement.ts"
import '../../utils/global.css'

// 定义广告项类型
interface AdvertisementItem {
  id: number;
  title: string;
  content: string;
  imgUrl: string;
  productId: number;
}

const advertisements = ref<AdvertisementItem[]>([])
const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 获取广告列表
const fetchAdvertisements = async () => {
  loading.value = true
  try {
    const res = await getAdvertisements();
    advertisements.value = (res.data ?? []).map((ad: AdvertisementItem) => ({
      ...ad,
      imgUrl: ad.imgUrl ?? ''
    }));
  } catch (error) {
    ElMessage.error('获取广告列表失败');
    console.error('获取失败:', error);
  } finally {
    loading.value = false
  }
};

// 跳转编辑页面
const handleEdit = (id: number) => {
  router.push(`/advertisement/edit?id=${id}`)
}

// 删除广告
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
        '删除后无法恢复，确定要删除该广告吗？',
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
    )

    // 开启局部 loading
    loading.value = true
    await deleteAdvertisement(id)
    ElMessage.success('删除成功')
    await fetchAdvertisements()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
    // 如果是取消，不需要做任何事，loading 状态在 finally 中恢复不适用这里，
    // 因为 fetchAdvertisements 会处理 loading。
    // 如果没有重新 fetch，需要手动关闭 loading
    if(e === 'cancel') loading.value = false
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
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" link class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回控制台</span>
        </el-button>
        <div class="divider-vertical"></div>
        <h2 class="page-title">广告管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="router.push('/advertisement/edit')">
          <el-icon class="el-icon--left"><Plus /></el-icon>
          新增广告
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper" v-loading="loading">

      <!-- 列表网格 -->
      <div v-if="advertisements.length > 0" class="ad-grid">
        <el-card
            v-for="ad in advertisements"
            :key="ad.id"
            class="ad-card"
            :body-style="{ padding: '0px' }"
            shadow="hover"
        >
          <!-- 图片区域 -->
          <div class="image-wrapper">
            <el-image
                :src="ad.imgUrl"
                fit="cover"
                loading="lazy"
                class="ad-image"
                :preview-src-list="[ad.imgUrl]"
                preview-teleported
            >
              <template #error>
                <div class="image-slot-error">
                  <el-icon><IconPicture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="image-tag">ID: {{ ad.id }}</div>
          </div>

          <!-- 内容区域 -->
          <div class="card-content">
            <h3 class="card-title" :title="ad.title">{{ ad.title }}</h3>
            <p class="card-desc" :title="ad.content">{{ ad.content }}</p>
          </div>

          <!-- 底部操作栏 -->
          <div class="card-actions">
            <el-button link type="primary" @click="handleEdit(ad.id)">
              <el-icon class="el-icon--left"><Edit /></el-icon> 编辑
            </el-button>
            <div class="divider-vertical-small"></div>
            <el-button link type="danger" @click="handleDelete(ad.id)">
              <el-icon class="el-icon--left"><Delete /></el-icon> 删除
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
          v-else-if="!loading"
          description="暂无广告数据"
          :image-size="200"
      >
        <el-button type="primary" @click="router.push('/advertisement/edit')">
          立即创建
        </el-button>
      </el-empty>

    </div>
  </div>
</template>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409eff;
  --bg-color: #f5f7fa;
  --text-main: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #ebeef5;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.page-header {
  background: #fff;
  padding: 0 40px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  font-size: 15px;
  color: var(--text-regular);
}
.back-btn:hover {
  color: var(--primary-color);
}

.divider-vertical {
  width: 1px;
  height: 16px;
  background: #dcdfe6;
  margin: 0 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

/* 内容区域 */
.content-wrapper {
  padding: 30px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Grid 布局 */
.ad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 响应式卡片宽度 */
  gap: 24px;
}

/* 卡片样式 */
.ad-card {
  border: none;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ad-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* 图片区域 */
.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9; /* 固定 16:9 比例 */
  background: #f5f7fa;
  overflow: hidden;
}

.ad-image {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.5s;
}

.ad-card:hover .ad-image {
  transform: scale(1.05);
}

.image-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

.image-slot-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #c0c4cc;
  font-size: 24px;
}

/* 卡片内容 */
.card-content {
  padding: 16px;
  flex-grow: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  /* 限制显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px; /* line-height * 2 */
}

/* 底部操作栏 */
.card-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fafafa;
}

.divider-vertical-small {
  width: 1px;
  height: 14px;
  background: #e4e7ed;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    padding: 0 20px;
    height: 60px;
  }

  .content-wrapper {
    padding: 20px;
  }

  .ad-grid {
    grid-template-columns: 1fr; /* 手机端单列 */
  }
}
</style>