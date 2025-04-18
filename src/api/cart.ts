// src/api/cart.ts
import {axios} from '../utils/request'
export const addToCart = (productId: string, quantity: number) => {
    return axios.post('/api/cart', { productId, quantity })
        .then(res=>{
            return res
        })

}

export const removeCartItem = (cartItemId: string) => {
    return axios.delete(`/api/cart/${cartItemId}`)
}

export const updateCartItem = (cartItemId: string, quantity: number) => {
    return axios.patch(`/api/cart/${cartItemId}`, { quantity })
}

export const getCartList = () => {
    return axios.get('/api/cart')
}