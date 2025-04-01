import axios from 'axios'

export interface Product {
    id?: string
    title: string
    price: number
    rate?: number
    description: string
    cover: string
    detail: string
    specifications: Specification[]
}

export interface Specification {
    id?: string
    item: string
    value: string
    productId: string
}

export interface Stock {
    id: string
    amount: number
    frozen: number
    productId: string
}

export const getProductList = () => axios.get('/api/products')

export const getProductDetail = (id: string) => axios.get(`/api/products/${id}`)

export const createProduct = (data: Product) => axios.post('/api/products', data)

export const updateProduct = (data: any) => axios.put('/api/products', data)

export const deleteProduct = (id: string) => axios.delete(`/api/products/${id}`)

export const getProductStock = (id: string) =>
    axios.get(`/api/products/stockpile/${id}`)

export const adjustStock = (id: string, amount: number) =>
    axios.patch(`/api/products/stockpile/${id}`, { amount })