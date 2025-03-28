<script setup lang="ts">
import {ref, computed} from 'vue'
import {router} from '../../router'
import {UploadFilled} from "@element-plus/icons-vue"
import {userRegister} from "../../api/user.ts"
import {uploadImage} from "../../api/tools.ts"

// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const username = ref('')
const password = ref('')
const name = ref('')
const avatar = ref('')
const role = ref('')
const telephone = ref('')
const email = ref('')
const location = ref('')
// const confirmEmail = ref('')
const confirmPassword = ref('')
const imageFileList = ref([])

//对于商家用户，还需要在注册时选择所属商店，从而传入storeId。但由于Lab2才会开发商店模块，所以这里暂且设置唯一一个Id为1的商店1，待Lab2完善
// const storeId = ref()

//用户名是否为空
const hasUsernameInput = computed(() => username.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
//姓名是否为空
const hasNameInput = computed(() => name.value != '')
// 头像Url是否为空
// const hasAvatarInput = computed(() => avatar.value != '')
// const hasImageFile = computed(() => avatar.value != '')
//身份是都为空
const hasRoleChosen = computed(() => role.value != '')
// 电话号码是否为空
const hasTelephoneInput = computed(() => telephone.value != '')
//邮箱是否为空
const hasEmailInput = computed(() => email.value != '')
//地址是否为空
// const hasLocationInput = computed(() => location.value != '')
// 重复密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
// 对于商家用户，商店Id是否为空
// const hasStoreName = computed(() => storeId.value != undefined)

// 电话号码的规则
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/
const telLegal = computed(() => chinaMobileRegex.test(telephone.value))

//邮箱格式规则
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailLegal = computed(() => emailRegex.test(email.value));

// 重复密码的规则
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)

// 注册按钮可用性
const registerDisabled = computed(() => {
  if (hasTelephoneInput.value && !telLegal.value)
    return true;
  if (hasEmailInput.value && !emailLegal.value)
    return true;
  if (!hasRoleChosen.value) {
    return true
  } else {
    return !(hasUsernameInput.value && hasPasswordInput.value && hasNameInput.value &&
        hasConfirmPasswordInput.value && isPasswordIdentical.value && hasRoleChosen.value
    )
  }
  // else if (role.value == 'ADMINISTRATOR') {
  //   return !(hasUsernameInput.value && hasPasswordInput.value && hasNameInput.value &&
  //       hasConfirmPasswordInput.value && isPasswordIdentical.value && hasRoleChosen.value
  //   )
  // }
})

// 注册按钮触发
function handleRegister() {
  userRegister({
    username: username.value,
    password: password.value,
    name: name.value,
    avatar: avatar.value,
    role: role.value,
    telephone: telephone.value,
    email: email.value,
    location: location.value,
  }).then(res => {
    if (res.data.code === '200') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      })
      router.push({path: "/login"})
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

function handleChange(file: any, fileList: any)
{
  imageFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    avatar.value = res.data.result
  }).catch(error => {
    console.error("图片上传失败:", error)
    ElMessage.error("图片上传失败，请重试！")
  })
}
function handleExceed() {
  ElMessage.warning(`当前限制选择 1 个文件`);
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}
</script>


<template>
  <el-main class="main-frame bgimage">
    <el-card class="login-card">
      <div>
        <h1>创建一个新的账户</h1>

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
                将图片拖到此处或单击此处上传。进允许上传一份文件
              </div>
            </el-upload>
          </el-form-item>

          <el-row>
            <el-col :span="7">
              <el-form-item>
                <label for="username">
                  <span class="required">*</span>用户名
                </label>
<!--                <label v-else class="error-warn" v-if="!hasUsernameInput">用户名不能为空</label>-->
                <el-input id="username" v-model="username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>

            <el-col :span="1"></el-col>

            <el-col :span="7">
              <el-form-item>
                <label for="name">
                  <span class="required">*</span>姓名
                </label>
                <el-input id="name" v-model="name" placeholder="请输入姓名"/>
              </el-form-item>
            </el-col>

            <el-col :span="1"></el-col>

            <el-col :span="8">
              <el-form-item>
                <label for="role">
                  <span class="required">*</span>身份
                </label>
                <el-select id="role"
                           v-model="role"
                           placeholder="请选择"
                           style="width: 100%;"
                >
                  <el-option value="CUSTOMER" label="顾客"/>
                  <el-option value="STAFF" label="商家"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item>

                <label v-if="!hasTelephoneInput" for="tel">
                  注册手机号
                </label>
                <label v-else-if="!telLegal" for="tel" class="error-warn">
                  手机号不合法
                </label>
                <label v-else for="tel">
                  注册手机号
                </label>

                <el-input id="tel"
                          v-model="telephone" :class="{'error-warn-input' :(hasTelephoneInput && !telLegal)}"
                          placeholder="请输入手机号"/>
              </el-form-item>
            </el-col>

            <el-col :span="1"></el-col>

            <el-col :span="15" v-if="role!=='ADMINISTRATOR'">
              <el-form-item>
                <label for="location">
                  地址
                </label>
                <el-input id="location"
                          v-model="location"
                          placeholder="请输入地址"/>
              </el-form-item>
            </el-col>

            <el-col :span="7" v-if="role==='STAFF'">
              <el-form-item>
                <label for="location">
                  地址
                </label>
                <el-input id="location"
                          v-model="location"
                          placeholder="请输入地址"/>
              </el-form-item>
            </el-col>

            <el-col :span="1" v-if="role==='STAFF'"></el-col>

<!--            <el-col :span="7" v-if="role==='STAFF'">-->
<!--              <el-form-item>-->
<!--                <label for="address">-->
<!--                  所属商店（需待Lab2中完善）-->
<!--                </label>-->
<!--                <el-select id="storeName"-->
<!--                           v-model="storeId"-->
<!--                           placeholder="请选择"-->
<!--                           style="width: 100%;"-->
<!--                >-->
<!--                  <el-option value="1" label="商店1"/>-->
<!--                </el-select>-->
<!--              </el-form-item>-->
<!--            </el-col>-->

          </el-row>

          <el-form-item>
            <label v-if="!hasEmailInput" for="email">邮箱</label>
            <label v-else-if="!emailLegal" for="email" class="error-warn">
              邮箱格式不合法
            </label>
            <label v-else for="email"> 邮箱 </label>
            <el-input type="email" id="email"
                      v-model="email"
                      placeholder="请输入邮箱地址"/>
          </el-form-item>

          <el-form-item>
            <label for="password">
              <span class="required">*</span>密码
            </label>
            <el-input type="password" id="password"
                      v-model="password"
                      placeholder="••••••••"/>
          </el-form-item>

          <el-form-item>
            <label v-if="!hasConfirmPasswordInput" for="confirm-password">
              <span class="required">*</span>确认密码
            </label>
            <label v-else-if="!isPasswordIdentical" class="error-warn">密码不一致</label>
            <label v-else>确认密码</label>

            <el-input type="password" id="confirm-password"
                      v-model="confirmPassword"
                      :class="{'error-warn-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}"
                      placeholder="••••••••"/>
          </el-form-item>

          <span class="button-group">
            <el-button @click.prevent="handleRegister"
                       :disabled="registerDisabled"
                       type="primary">
              创建账户
            </el-button>

            <router-link to="/login" v-slot="{navigate}">
              <el-button @click="navigate">
                去登录
              </el-button>
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
  background-image: url("../../assets/shopping-1s-1084px.svg");
}

.login-card {
  width: 60%;
  padding: 10px;
}

.error-warn {
  color: red;
}

.required {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}
</style>
