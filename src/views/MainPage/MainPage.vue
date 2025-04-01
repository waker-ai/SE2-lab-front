<script setup lang="ts">
import { ref, onMounted,computed} from 'vue'
import {useRouter} from 'vue-router'
import { getProductList, Product } from '../../api/product'

// 存储书籍列表
const books = ref<Product[]>([])

// 获取路由实例
const router = useRouter()

// 获取用户身份
const userRole = ref(sessionStorage.getItem('role')) // 从 sessionStorage 获取角色
const isAdmin = computed(() => userRole.value === 'ADMINISTRATOR') // 判断是否是管理员

// 获取书籍数据
const fetchBooks = async () => {
  try {
    const response = await getProductList()
    books.value = response.data
  } catch (error) {
    console.error('获取书籍失败:', error)
  }
}

// 组件加载时获取书籍
onMounted(fetchBooks)

const goToDetail=(id:string)=>{
  router.push(`/products/${id}`)
}

const goToManage=()=>{
  router.push('/admin/products')
}

const goToCreate=()=>{
  router.push('/createproduct')
}
</script>

<template>
  <el-main class="books-container">
    <div class="header">
    <h1>书籍展示</h1>
    <!--仅管理员可见-->
      <div class="admin-actions">
        <el-button v-if="isAdmin" type="primary" @click="goToCreate">创建书籍</el-button>
        <el-button v-if="isAdmin" type="danger" @click="goToManage">管理商品</el-button>
      </div>
    </div>

    <!--商品列表-->
    <el-row :gutter="20" class="product-item-list">
      <el-col v-for="book in books" :key="book.id" :span="6">
        <el-card shadow="hover" class="book-card" @click="goToDetail(book.id)">
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
