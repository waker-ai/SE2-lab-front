<script setup lang="ts">
import {ref, computed} from 'vue'
import {userInfo, userInfoUpdate} from '../../api/user.ts'
import {parseRole} from "../../utils"
import {router} from '../../router'
import {UserFilled, UploadFilled} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted } from 'vue'
import {checkMember} from "../../api/membership.ts";


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
const imageFileList = ref([])

const newUsername = ref('')
const newName = ref('')
const newAvatar = ref('')
const newRole = ref('')
const newTelephone = ref('')
const newEmail = ref('')
const newLocation = ref('')

const displayInfoCard = ref(false)
const isMember = ref(false)

// 电话号码的规则
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/
//邮箱格式规则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
const changeDisabled = computed(() => {
  return !(hasConfirmPasswordInput.value && isPasswordIdentical.value)
})

onMounted(() => {
  getUserInfo()
})

// watch([newUsername, newName, newAvatar, newRole, newTelephone, newEmail, newLocation], ([newU, newN, newA, newR, newT, newE, newL]) => {
//   console.log("用户信息发生修改：");
//   if (newU !== username.value) console.log(`用户名: ${username.value} -> ${newU}`);
//   if (newN !== name.value) console.log(`姓名: ${name.value} -> ${newN}`);
//   if (newA !== avatar.value) console.log(`头像: ${avatar.value} -> ${newA}`);
//   if (newR !== role.value) console.log(`角色: ${role.value} -> ${newR}`);
//   if (newT !== telephone.value) console.log(`电话: ${telephone.value} -> ${newT}`);
//   if (newE !== email.value) console.log(`邮箱: ${email.value} -> ${newE}`);
//   if (newL !== location.value) console.log(`地址: ${location.value} -> ${newL}`);
// });

function getUserInfo() {
  userInfo().then(res => {
    // console.log(res)
    username.value = res.data.data.username
    name.value = res.data.data.name
    role.value = res.data.data.role
    avatar.value = res.data.data.avatar
    telephone.value = res.data.data.telephone
    email.value = res.data.data.email
    location.value = res.data.data.location
    newUsername.value = res.data.data.username
     checkMemberStatus(username.value)
  })
}
async function checkMemberStatus(username: string) {
  try {
    const response = await checkMember(username)
    isMember.value = response.data.data
    console.log('返回值',response.data)
    console.log('isMember', isMember.value)
  } catch (error) {
    console.error('检查会员状态失败:', error)
  }
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
    console.log(res)
    if (res.data.code === '200') {
      ElMessage({
        customClass: 'customMessage',
        type: 'success',
        message: '更新成功！',
      })
      // 清空选择的图片列表
      imageFileList.value = [];
      newAvatar.value = '';
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
    name: undefined,
    avatar: undefined,
    role: undefined,
    telephone: undefined,
    email: undefined,
    location: undefined,
    password: password.value,
  }).then(res => {
    if (res.data.code === '200') {
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
          }).then(() => router.replace({path: "/login"}))
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

function handleChange(file: any, fileList: any)
{
  imageFileList.value = fileList
  imageFileList.value = fileList
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newAvatar.value = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

function handleExceed() {
  ElMessage.warning(`当前限制选择 1 个文件`);
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

function goToMemberList() {
  router.push('/MemberList')
}

function goToMemberCharge() {
  router.push('/MemberCharge')
}

function goToMemberDetail() {
  router.push('/MemberDetail')
}

function goToOrderHistory() {
  router.push({ path: '/orderHistory' })
}


</script>


<template>
  <el-main class="main-container">
    <el-card class="aside-card">
      <div class="avatar-area">
        <el-avatar :src="avatar" :size="80">
          <UserFilled v-if="!(avatar)" />
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

      <el-divider>
        <el-button type="primary" @click="goToOrderHistory">
          我的订单
        </el-button>
      </el-divider>
    </el-card>

    <el-card v-if="displayInfoCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button @click="updateInfo">更新</el-button>
        </div>
      </template>

      <el-form>
        <el-form-item label="头像">
          <el-upload
              v-model:file-list="imageFileList"
              :limit="1"
              :on-change="handleChange"
              :on-exceed="handleExceed"
              :on-remove="handleChange"
              class="upload-demo"
              list-type="picture"
              :http-request="uploadHttpRequest"
              drag>
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">
              将图片拖到此处或单击此处上传，仅允许上传一张图片
            </div>
          </el-upload>
        </el-form-item>
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

        <el-form-item>
          <label for="email">邮箱</label>
          <el-input id="email" v-model="newEmail" :rules="[{ pattern: emailRegex, message: '邮箱格式错误', trigger: 'blur' }]" />
        </el-form-item>

        <el-form-item v-if="role === 'CUSTOMER'">
          <label for="address">地址</label>
          <el-input id="address" type="textarea"
                    rows="4"
                    v-model="newLocation" placeholder="中华门"></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="membership-section">
      <el-button v-if="role === 'ADMINISTRATOR'" type="primary" @click="goToMemberList">
        查看会员列表
      </el-button>
      <el-button v-else-if="!isMember" type="primary" @click="goToMemberCharge">
        充值会员
      </el-button>
      <el-button v-else type="primary" @click="goToMemberDetail">
        查看会员详情
      </el-button>
    </div>

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