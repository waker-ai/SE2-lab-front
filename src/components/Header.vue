<script setup lang="ts">
import {router} from '../router'
// import {parseRole} from "../utils"
import {User, SwitchButton, House} from "@element-plus/icons-vue"   //图标
import { Tickets } from "@element-plus/icons-vue"
import { Plus } from "@element-plus/icons-vue"

import {Search} from "@element-plus/icons-vue";

const role = sessionStorage.getItem('role')    //登录的时候插入的

//退出登录

function logout() {
  ElMessageBox.confirm(
      '是否要退出登录？',
      '提示',
      {
        customClass: "customDialog",
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true
      }
  ).then(() => {
    // sessionStorage.setItem('username', '')
    sessionStorage.clear(); // 确保清空所有存储信息
    router.push({path: "/login"})
  })
}
</script>


<template>
  <el-header class="custom-header" height="20">
    <el-row :gutter="10">

      <el-col :span="3" class="header-icon">
        <router-link to="/dashboard" v-slot="{navigate}" class="no-link">
          <h1 @click="navigate" class="header-text"> 草根书店</h1>
        </router-link>
      </el-col>

      <el-col :span="2">
        <!--        <el-tag class="role-tag" size="large">{{ parseRole(role) }}版</el-tag>-->
      </el-col>

      <el-col :span="13">
      </el-col>
      <el-col :span="1" class="header-icon">
        <router-link
            v-if="role === 'CUSTOMER'"
            to="/coupon"
            v-slot="{ navigate }">
          <el-icon @click="navigate" :size="35" color="white"><Tickets /></el-icon>
        </router-link>

        <router-link
            v-else-if="role === 'ADMINISTRATOR'"
            to="/couponedit"
            v-slot="{ navigate }">
          <el-icon @click="navigate" :size="35" color="white"><Plus /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <router-link to="/search" v-slot="{navigate}">
          <el-icon @click="navigate" :size="35" color="white"><Search /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <router-link to="/mainpage" v-slot="{navigate}">
          <el-icon @click="navigate" :size="35" color="white" ><House /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <router-link to="/dashboard" v-slot="{navigate}">
          <el-icon @click="navigate" :size="35" color="white" ><User /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="35" color="white" ><SwitchButton /></el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>


<style scoped>
.custom-header {
  background-color: #409eff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  display: flex;
  flex-direction: column;
}

.no-link {
  text-decoration: none;
}

.role-tag {
  margin-top: 20px;
  font-size: 20px;
}

.header-text {
  color:white;
  font-size: x-large;
  min-width: max-content;
  margin-top: 15px;
  margin-bottom: 15px;
}

.header-icon {
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
}
</style>