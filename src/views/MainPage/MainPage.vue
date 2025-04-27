<script setup lang="ts">
import { ref, onMounted,computed} from 'vue'
import {useRouter} from 'vue-router'
import { getProductList, Product } from '../../api/product'
import {getAdvertisements,Advertisement} from "../../api/advertisement.ts";

// 存储书籍列表
const books = ref<Product[]>([])
// 存储广告列表
const advertisements = ref<Advertisement[]>([]) // 新增

// 获取路由实例
const router = useRouter()

// 获取用户身份
const userRole = ref(sessionStorage.getItem('role')) // 从 sessionStorage 获取角色
// const isAdmin = computed(() => userRole.value === 'ADMINISTRATOR') // 判断是否是管理员
const isAdmin = computed(() => {
  console.log('当前 userRole.value:', userRole.value)
  return userRole.value === 'ADMINISTRATOR'
})


// 获取书籍数据
const fetchBooks = async () => {
  try {
    const response = await getProductList()
    console.log(response.data)
    books.value = response.data.data
  } catch (error) {
    console.error('获取书籍失败:', error)
  }
}

// 组件加载时获取书籍
onMounted(fetchBooks)
// 新增：获取广告数据
const fetchAdvertisements = async () => {
  try {
    const res = await getAdvertisements()
    advertisements.value = res.data
  } catch (error) {
    console.error('获取广告失败:', error)
  }
}
// 组件加载时获取书籍和广告
onMounted(async () => {
  await fetchAdvertisements() // 新增
})

const goToDetail=(id:number)=>{
  router.push(`/products/${id}`)
}

const goToManage=()=>{
  router.push('/admin/products')
}

const goToCreate=()=>{
  router.push('/createproduct')
}
const goToCart=()=>{
  router.push('/cart')
}
// 新增：前往新增广告页面
const goToCreateAdvertisement = () => {
  router.push('/advertisement/edit')
}

// 新增：前往广告列表页面
const goToAdvertisementList = () => {
  router.push('/advertisement')
}
</script>

<template>
  <el-main class="books-container">
    <!-- 新增：广告展示模块 -->
    <el-carousel :interval="5000" arrow="always">
      <el-carousel-item v-for="ad in advertisements" :key="ad.id">
        <el-image :src="ad.imgUrl" fit="cover" style="width: 100%; height: 200px;" />
      </el-carousel-item>
    </el-carousel>

    <div class="user-actions">
      <!-- 新增：新增广告和广告列表按钮 -->
      <el-button v-if="isAdmin" type="primary" @click="goToCreateAdvertisement">
        新增广告
      </el-button>
      <el-button v-if="isAdmin" type="primary" @click="goToAdvertisementList">
        广告列表
      </el-button>
    </div>

    <div class="header">
      <h1>书籍展示</h1>
      <div class="user-actions">
        <el-button type="primary" @click="goToCart" icon="ShoppingCart">
          购物车
        </el-button>
      </div>
      <!--仅管理员可见-->
      <div class="admin-actions">
        <el-button v-if="isAdmin" type="primary" @click="goToCreate">创建书籍</el-button>
        <el-button v-if="isAdmin" type="danger" @click="goToManage">管理商品</el-button>
      </div>
    </div>

    <!--商品列表-->
    <el-row :gutter="20" class="product-item-list">
      <el-col v-for="book in books" :key="book.id" :span="6">
        <el-card shadow="hover" class="book-card" @click="goToDetail(book.id!)">
          <img :src="book.cover" class="book-cover" />
          <div class="book-title">{{ book.title }}</div>
          <div class="book-price">￥{{book.price}}</div>
          <div class="book-rate">评分：{{book.rate}}</div>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<style scoped>
.books-container {
  padding: 20px;
  text-align: center;
}

.book-card {
  text-align: center;
  padding: 10px;
  cursor:pointer;
}

.book-card{
  transform: scale(1.05);
  transition: 0.3s ease-in-out;
}

.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.book-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
</style>