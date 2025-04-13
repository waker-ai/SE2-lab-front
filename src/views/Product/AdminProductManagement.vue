<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductList, deleteProduct,adjustStock, Product } from '../../api/product'
import { ElMessage, ElMessageBox } from 'element-plus'

// 商品列表
const products = ref<Product[]>([])

// 获取商品数据
const fetchProducts = async () => {
  try {
    const response = await getProductList()
    products.value = response.data.data
  } catch (error) {
    console.error('获取商品失败:', error)
  }
}

// 删除商品
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定删除该商品吗？', '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProduct(id)
      ElMessage.success('删除成功')
      fetchProducts() // 重新获取商品列表
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 修改库存
const handleAdjustStock = async (id: number) => {
  const newStock = prompt('请输入新的库存数量:')
  if (newStock) {
    try {
      await adjustStock(id, Number(newStock))
      ElMessage.success('库存调整成功')
      fetchProducts()
    } catch (error) {
      ElMessage.error('库存调整失败')
    }
  }
}

onMounted(fetchProducts)
</script>

<template>
  <el-main class="admin-container">
    <h1>商品管理</h1>
    <el-table :data="products" border style="width: 100%">
      <el-table-column prop="title" label="书名" width="200" />
      <el-table-column prop="price" label="价格" width="100" />
      <el-table-column prop="rate" label="评分" width="100" />
      <el-table-column prop="id" label="商品ID" width="150" />
      <el-table-column prop="stockAmount" label="库存" width="120" />
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button type="warning" @click="handleAdjustStock(row.id)">调整库存</el-button>
          <el-button type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-main>
</template>

<style scoped>
.admin-container {
  padding: 20px;
}
</style>
