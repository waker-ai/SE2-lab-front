<template>
  <el-main class="main-wrapper">
    <!-- 广告轮播 -->
    <div class="carousel-container">
      <el-carousel :interval="5000" arrow="always" height="400px">
        <el-carousel-item v-for="ad in advertisements" :key="ad.id">
          <el-image :src="ad.imgUrl" fit="contain" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <!-- 管理员操作按钮 -->
      <div class="admin-bar" v-if="isAdmin">
        <el-button class="action-btn" @click="goToCreateAdvertisement">
          <i class="fas fa-plus-circle"></i> 新增广告
        </el-button>
        <el-button class="action-btn" @click="goToAdvertisementList">
          <i class="fas fa-list"></i> 广告列表
        </el-button>
        <el-button class="action-btn" @click="goToCreate">
          <i class="fas fa-book-medical"></i> 创建书籍
        </el-button>
        <el-button class="action-btn" type="danger" @click="goToManage">
          <i class="fas fa-cog"></i> 管理商品
        </el-button>


      </div>

      <!-- 用户操作按钮 -->
      <el-button class="action-btn" @click="goToHotProducts">
        <i class="fas fa-hot-books"></i> 热门书籍
      </el-button>
      <div class="user-bar">
        <el-button class="action-btn" type="primary" @click="goToCart">
          <i class="fas fa-shopping-cart"></i> 购物车
        </el-button>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tags">
      <div
          v-for="cat in categories"
          :key="cat.value"
          :class="['tag', { active: selectedCategory === cat.value }]"
          @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
      </div>
    </div>

    <!-- 商品展示区 -->
    <div class="book-grid">
      <el-card
          v-for="book in filteredBooks"
          :key="book.id"
          class="book-card"
          shadow="hover"
          @click="goToDetail(book.id)"
      >
        <img :src="book.cover" class="book-cover" />
        <div class="book-info">
          <div class="book-title">{{ book.title }}</div>
          <div class="book-price">￥{{ book.price }}</div>
          <div class="book-rate" v-if="book.rate !== undefined">
            评分：{{ book.rate.toFixed(2) }}
          </div>
          <div class="book-rate" v-else>
            暂无评分
          </div>
        </div>
      </el-card>
    </div>
  </el-main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList, Product } from '../../api/product'
import { getAdvertisements, Advertisement } from "../../api/advertisement.ts"
import { ElMessage } from 'element-plus'

const books = ref<Product[]>([])
const advertisements = ref<Advertisement[]>([])
const router = useRouter()
const userRole = ref(sessionStorage.getItem('role'))
const isAdmin = computed(() => userRole.value === 'ADMINISTRATOR')

const fetchBooks = async () => {
  try {
    const response = await getProductList()
    books.value = response.data.data
  } catch (error) {
    console.error('获取书籍失败:', error)
    ElMessage.error('获取书籍数据失败')
  }
}

const fetchAdvertisements = async () => {
  try {
    const res = await getAdvertisements()
    advertisements.value = res.data
  } catch (error) {
    console.error('获取广告失败:', error)
    ElMessage.error('获取广告数据失败')
  }
}

const categories = [
  { label: '全部', value: 'ALL' },
  { label: '文学', value: 'LITERATURE' },
  { label: '科技', value: 'TECH' },
  { label: '儿童', value: 'CHILDREN' },
  { label: '艺术', value: 'ART' },
  { label: '历史', value: 'HISTORY' },
  { label: '小说', value: 'FICTION' }
]

const selectedCategory = ref('ALL')

const filteredBooks = computed(() => {
  if (selectedCategory.value === 'ALL') {
    return books.value
  } else {
    return books.value.filter(book => book.category === selectedCategory.value)
  }
})

onMounted(() => {
  fetchBooks()
  fetchAdvertisements()
})

const goToDetail = (id: number) => router.push(`/products/${id}`)
const goToManage = () => router.push('/admin/products')
const goToCreate = () => router.push('/createproduct')
const goToHotProducts = () => router.push('/HotProductsList')
const goToCart = () => router.push('/cart')
const goToCreateAdvertisement = () => router.push('/advertisement/edit')
const goToAdvertisementList = () => router.push('/advertisement')
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary: #3498db;
  --secondary: #2ecc71;
  --accent: #e74c3c;
  --light: #f8f9fa;
  --dark: #343a40;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

body {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  min-height: 100vh;
  margin: 0;
  padding: 0;
  color: var(--dark);
}

.main-wrapper {
  background-color: #fff;
  padding: 30px 60px;
  margin: 0 auto;
  /* 删除 max-width */
  /* max-width: 1280px; */
  box-sizing: border-box;
  width: 100%;
}

/* 轮播图样式 */
.carousel-container {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  /* 新增宽度控制 */
  max-width: 730px;
  margin-left: auto;
  margin-right: auto;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.carousel-container:hover .carousel-image {
  transform: scale(1.03);
}

/* 操作按钮区域 */
.action-bar {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
  flex-wrap: wrap;
  gap: 15px;
}

.admin-bar, .user-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 500;
  transition: var(--transition);
}

.action-btn i {
  margin-right: 8px;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 分类标签 */
.category-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 30px 0;
}

.tag {
  padding: 10px 24px;
  font-size: 16px;
  border-radius: 30px;
  border: 1px solid var(--light-gray);
  background-color: #fff;
  cursor: pointer;
  transition: var(--transition);
}

.tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.tag.active {
  background: linear-gradient(135deg, var(--primary), #4a69bd);
  color: #222;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

/* 商品网格 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  position: relative;
  transition: transform 0.3s;
  flex-direction: column;
  border: none;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-bottom: 1px solid var(--light-gray);
}

.book-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.book-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
  min-height: 50px;
}

.book-price {
  color: var(--accent);
  font-weight: 700;
  font-size: 22px;
  margin: 10px 0;
}

.book-rate {
  margin: 10px 0;
}

.book-actions {
  margin-top: auto;
  padding-top: 15px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-wrapper {
    padding: 25px;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 992px) {
  .carousel-container {
    margin-bottom: 30px;
  }

  .action-bar {
    flex-direction: column;
    align-items: center;
  }

  .admin-bar, .user-bar {
    width: 100%;
    justify-content: center;
  }

  .category-tags {
    gap: 12px;
  }

  .tag {
    padding: 8px 20px;
    font-size: 15px;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    padding: 20px;
    margin: 10px;
  }

  .carousel-container {
    border-radius: 12px;
  }

  .action-btn {
    padding: 10px 18px;
    font-size: 14px;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .book-cover {
    height: 280px;
  }
}

@media (max-width: 576px) {
  .main-wrapper {
    padding: 15px;
  }

  .book-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .book-cover {
    height: 350px;
  }

  .tag {
    padding: 6px 15px;
    font-size: 14px;
  }
}
</style>