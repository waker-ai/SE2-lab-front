<script setup lang="ts">
import {ElForm, ElFormItem} from "element-plus"
import {ref, computed} from 'vue'
import {router} from '../../router'
import {userInfo, userLogin} from "../../api/user.ts"


// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const username = ref('')
const password = ref('')

//用户名是否为空
const hasUserNameInput = computed(() => username.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
//用户名的规则暂无

// 密码不设置特殊规则
// 登录按钮可用性
const loginDisabled = computed(() => {
  return !(hasUserNameInput.value &&  hasPasswordInput.value)
})

// 登录按钮触发
function handleLogin() {
  userLogin({
    username: username.value,
    password: password.value
  }).then(res => {
    sessionStorage.setItem('username',username.value)
    console.log('username',username.value)
    // console.log(res)
    if (res.data.code === '200') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.data
      console.log(token)
      sessionStorage.setItem('token', token)
      //sessionStorage.setItem('role', res.data.data.role)
      userInfo().then(res=>{
        console.log(res)

        sessionStorage.setItem('role',res.data.data.role)

        console.log('role',res.data.data.role)

        router.push({path: "/mainpage"})
      })

    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}
</script>


<template>
  <el-main class="main-frame bgimage">
    <el-card class="login-card">
      <div>
        <h1 class="login-title">登入您的账户</h1>
        <el-form>
          <el-form-item>
            <label for="username">用户名</label>
            <el-input id="username" type="text" v-model="username"
                      required
                      placeholder="请输入用户名"
                      class="transparent-input"/>
          </el-form-item>

          <el-form-item>
            <label for="password">账户密码</label>
            <el-input id="password" type="password" v-model="password"
                      required
                      placeholder="••••••••"
                      class="transparent-input"
            />
          </el-form-item>

          <span class="button-group">
              <el-button @click.prevent="handleLogin" :disabled="loginDisabled"
                         type="primary">登入</el-button>
              <router-link to="/register" v-slot="{navigate}">
                <el-button @click="navigate">去注册</el-button>
              </router-link>
          </span>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>


<style scoped>
.main-frame {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bgimage {
  background-image: url("../../assets/background.png");
  background-size: cover;
  background-position: center;
}

.login-card {
  width: 400px;
  padding: 30px;
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  background-color: rgba(255, 255, 255, 0.1); /* 半透明背景 */
  border-radius: 15px;
}

.login-title {
  color: white !important;
  margin-bottom: 25px;
  text-align: center;
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(.transparent-input .el-input__inner) {
  background-color: transparent !important;
  border: 1px solid rgba(0, 0, 0, 0.3);
  color: #333333 !important;
  caret-color: #409EFF; /* 光标颜色 */
}

:deep(.transparent-input .el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.transparent-input .el-input__inner:hover) {
  border-color: rgba(255, 255, 255, 0.6);
}

:deep(.transparent-input .el-input__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-form-item__label {
  color: white !important;
  font-weight: bold;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

</style>