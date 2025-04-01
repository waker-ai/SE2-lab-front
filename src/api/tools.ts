import {axios} from '../utils/request'
import {API_MODULE} from './_prefix'

// 上传图片文件
export const uploadImage = (payload: any) => {
    console.log("Uploading image to:", `${API_MODULE}/images`); // 打印 API 地址，检查是否正确
    return axios.post(`${API_MODULE}/images`, payload, {
        headers: {
            'Content-Type': "multipart/form-data;"
        }
    })
        .then(res => {
            console.log("Upload response:", res); // 打印后端返回的响应
            return res
        })
        .catch(err => {
            console.error("Upload error:", err); // 打印上传错误
            throw err; // 让前端可以正确捕获错误
        });
}