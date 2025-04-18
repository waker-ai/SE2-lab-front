import {axios} from '../utils/request'//不能是 axios from 'axios'
import {USER_MODULE} from './_prefix'

type LoginInfo = {
    username: string,
    password: string
}

type RegisterInfo = {
    username: string, //用户名，必须唯一
    password: string,
    name: string, //真实姓名
    avatar?: string, //头像URL
    role: string,
    telephone?: string,
    email?: string,
    location?: string
}

type UpdateInfo = {
    username: string,
    password?: string,
    name?: string,
    avatar?: string,
    role?: string,
    telephone?: string,
    email?: string,
    location?: string,
}

// 如果有“Vue: This may be converted to an async function”警告，可以不管
// 用户登录
export const userLogin = (loginInfo: LoginInfo) => {
    return axios.post(`${USER_MODULE}/login`, null, {params: loginInfo})
        .then(res => {
            console.log(res)
            return res
        })
}

// 创建用户
export const userRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${USER_MODULE}`, registerInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取用户信息
// 获取用户信息
export const userInfo = () => {
    const token = sessionStorage.getItem('token');
    console.log("token", token)
    const username = sessionStorage.getItem('username');
    return axios.get(`${USER_MODULE}/${username}`, {
        headers: {
            'token': token
        }
    })
        .then(res => {
            console.log("User info response:", res);
            return res;
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
            throw error;
        });
}

// 更新用户信息
export const userInfoUpdate = (updateInfo: UpdateInfo) => {
    return axios.put(`${USER_MODULE}`, updateInfo, {headers: {'Content-Type': 'application/json'}},)
        .then(res => {
            return res
        })
}