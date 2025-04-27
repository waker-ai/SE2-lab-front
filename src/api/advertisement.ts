// src/api/advertisement.ts
import {axios} from '../utils/request'


export interface Advertisement {
    id?: number
    title: string
    content: string
    imgUrl: string
    productId: number
}
// 获取广告列表
export const getAdvertisements = () => {
    return axios.get('/api/advertisements')
}

// 删除广告
export const deleteAdvertisement = (id: number) => {
    return axios.delete(`/api/advertisements/${id}`)
}

// 创建广告
export const createAdvertisement = (data: any) => {
    return axios.post('/api/advertisements', data)
}

// 更新广告
export const updateAdvertisement = (data: any) => {
    return axios.put('/api/advertisements', data)
}
