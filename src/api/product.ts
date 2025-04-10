import axios from 'axios'

export interface Product {
    id?: number
    title: string
    price: number
    rate?: number
    description: string
    cover: string
    detail: string
    specifications: Specification[]
}

export interface Specification {
    id?: number
    item: string
    value: string
    productId: string
}

export interface Stock {
    id: number
    amount: number
    frozen: number
    productId: string
}

export const getProductList = () => axios.get('/api/products')

export const getProductDetail = (id: number) => axios.get(`/api/products/${id}`)

export const createProduct = (data: Product) => axios.post('/api/products', data)

export const updateProduct = (data: any) => axios.put('/api/products', data)

export const deleteProduct = (id: number) => axios.delete(`/api/products/${id}`)

export const getProductStock = (id: number) =>
    axios.get(`/api/products/stockpile/${id}`)

export const adjustStock = (id: number, amount: number) =>
    axios.patch(`/api/products/stockpile/${id}`, { amount })