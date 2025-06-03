import {axios} from '../utils/request'

export interface Product {
    id?: number
    category: string
    title: string
    price: number
    rate?: number
    description: string
    cover: string
    detail: string
    specifications: Specification[]
    stockAmount: number  // 库存数量
    frozen: number
}

export interface Specification {
    id?: number
    item: string
    value: string
    productId: string
}


export const getProductList = () => axios.get('/api/products')

export const getProductDetail = (id: number) => axios.get(`/api/products/${id}`)

export const createProduct = (data: Product) => axios.post('/api/products', data)

export const updateProduct = (data: any) => axios.put('/api/products', data)

export const deleteProduct = (id: number) => axios.delete(`/api/products/${id}`)

export const getProductStock = (id: number) => axios.get(`/api/products/stockpile/${id}`)

export function adjustStock(productId: number, amount: number) {
    return axios.patch(`/api/products/stockpile/${productId}?amount=${amount}`)
}

export const getProductReviews = async (productId : number) => {
    return axios.get(`/api/reviews/${productId}`)
}