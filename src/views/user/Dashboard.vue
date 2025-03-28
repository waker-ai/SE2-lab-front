<script setup lang="ts">
import {ref, computed} from 'vue'
import {userInfo, userInfoUpdate} from '../../api/user.ts'
import {parseRole} from "../../utils"
import {router} from '../../router'
import {UserFilled} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')

const role = ref('')
const avatar = ref('')
// const storeName = ref('')
const telephone = ref('')
const email = ref('')
const location = ref('')

const newUsername = ref('')
const newName = ref('')
const newAvatar = ref('')
const newRole = ref('')
const newTelephone = ref('')
const newEmail = ref('')
const newLocation = ref('')

const displayInfoCard = ref(false)

// 电话号码的规则
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/
//邮箱格式规则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
const changeDisabled = computed(() => {
  return !(hasConfirmPasswordInput.value && isPasswordIdentical.value)
})

function getUserInfo() {
  userInfo().then(res => {
    username.value = res.data.data.username
    name.value = res.data.data.name
    role.value = res.data.data.role
    avatar.value = res.data.data.avatar
    telephone.value = res.data.data.telephone
    email.value = res.data.data.email
    location.value = res.data.data.location
    newName.value = res.data.data.username
  })
}

function updateInfo() {
  userInfoUpdate({
    username: newUsername.value || username.value,
    name: newName.value || name.value,
    avatar: newAvatar.value || avatar.value,
    role: newRole.value || role.value,
    telephone: newTelephone.value || telephone.value,
    email: newEmail.value || email.value,
    location: newLocation.value || location.value,
    password: undefined,
  }).then(res => {
    if (res.data.code === '200') {
      ElMessage({
        customClass: 'customMessage',
        type: 'success',
        message: '更新成功！',
      })
      getUserInfo()
    } else if (res.data.code === '400') {
      ElMessage({
        customClass: 'customMessage',
        type: 'error',
        message: res.data.msg,
      })
    }
  })
}

function updatePassword() {
  userInfoUpdate({
    username: username.value,
    // name: newName.value || name.value,
    // avatar: avatar.value,
    // role: role.value,
    // telephone: telephone.value,
    // email: email.value,
    // location: location.value,
    password: undefined,
  }).then(res => {
    if (res.data.code === '000') {
      password.value = ''
      confirmPassword.value = ''
      ElMessageBox.alert(
          `请重新登录`,
          '修改成功',
          {
            customClass: "customDialog",
            confirmButtonText: '跳转到登录',
            type: "success",
            showClose: false,
            roundButton: true,
            center: true
          }).then(() => router.push({path: "/login"}))
    } else if (res.data.code === '400') {
      ElMessage({
        customClass: 'customMessage',
        type: 'error',
        message: res.data.msg,
      })
      password.value = ''
      confirmPassword.value = ''
    }
  })
}
</script>


<template>
  <el-main class="main-container">
    <el-card class="aside-card">
      <div class="avatar-area">
        <el-avatar :icon="UserFilled" :size="80">
        </el-avatar>
        <span class="avatar-text"> 欢迎您，{{ name }}</span>
      </div>

      <el-divider></el-divider>

      <el-descriptions
          :column="1"
          border
          title="个人信息"
      >
        <template #extra>
          <el-button type="primary"
                     @click="displayInfoCard = displayInfoCard === false;">
            <span v-if="displayInfoCard">修改密码</span>
            <span v-else>修改个人信息</span>
          </el-button>
        </template>

        <el-descriptions-item label="用户名">
          <el-tag>{{username}}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="身份">
          <el-tag>{{ parseRole(role) }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="联系电话">
          {{ telephone }}
        </el-descriptions-item>

        <el-descriptions-item label="邮箱">
          {{ email }}
        </el-descriptions-item>

        <el-descriptions-item label="地址" v-if="role == 'CUSTOMER' ">
          {{ location }}
        </el-descriptions-item>

      </el-descriptions>
    </el-card>

    <el-card v-if="displayInfoCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button @click="updateInfo">更新</el-button>
        </div>
      </template>

      <el-form>
        <el-form-item>
          <label for="username">用户名</label>
          <el-input type="text" id="username" v-model="newUsername"/>
        </el-form-item>

        <el-form-item>
          <label for="name">姓名</label>
          <el-input type="text" id="name" v-model="newName"/>
        </el-form-item>

        <el-form-item>
          <label for="role">身份</label>
          <el-select v-model="newRole">
            <el-option label="管理员" value="ADMINISTRATOR"></el-option>
            <el-option label="普通用户" value="CUSTOMER"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <label for="phone">手机号</label>
          <el-input id="phone" v-model="newTelephone"
                    :rules="[{ pattern: chinaMobileRegex, message: '手机号格式错误', trigger: 'blur' }]" />
        </el-form-item>

        <el-form-tiem>
          <label for="email">邮箱</label>
          <el-input id="email" v-model="newEmail" :rules="[{ pattern: emailRegex, message: '邮箱格式错误', trigger: 'blur' }]" />
        </el-form-tiem>

        <el-form-item v-if="role === 'CUSTOMER' || role === 'STAFF'">
          <label for="address">地址</label>
          <el-input id="address" type="textarea"
                    rows="4"
                    v-model="newLocation" placeholder="中华门"></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="!displayInfoCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
          <el-button @click="updatePassword" :disabled="changeDisabled">
            修改
          </el-button>
        </div>
      </template>

      <el-form>
        <el-form-item>
          <label for="password">密码</label>
          <el-input type="password" id="password" v-model="password" placeholder="•••••••••" required/>
        </el-form-item>
        <el-form-item>
          <label v-if="!hasConfirmPasswordInput" for="confirm_password">确认密码</label>
          <label v-else-if="!isPasswordIdentical" for="confirm_password" class="error-warn">密码不一致</label>
          <label v-else for="confirm_password">确认密码</label>

          <el-input type="password" id="confirm_password" v-model="confirmPassword"
                    :class="{'error-warn-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}"
                    placeholder="•••••••••" required/>
        </el-form-item>
      </el-form>

    </el-card>
  </el-main>

</template>


<style scoped>

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.main-container {
  display: flex;
  flex-direction: row;
  padding: 15px;
  gap: 5px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-card {
  width: 66%;
}

.avatar-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.avatar-text {
  font-size: x-large;
  font-weight: bolder;
  padding-right: 40px;
}


</style>
