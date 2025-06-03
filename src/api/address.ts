import {axios} from '../utils/request'



export interface Address {
    id?: number
    username?: string
    addresseeName?: string
    phone?: string
    deliveryAddress?: string
    defaultAddress?: boolean
    postalCode?: string
}

export const getAddresses = (username: string) => axios.get(`/api/addresses?username=${username}`)

export const addAddress = (data:Address) => axios.post('/api/addresses',data)

export const updateAddress = (id:number,data:Address) => axios.put(`/api/addresses/${id}`, data);

export const  getDefaultAddress= (username: string) => axios.get(`/api/addresses/default?username=${username}`)

export const deleteAddress = (id:number) => axios.delete(`/api/addresses/${id}`)


export const setDefaultAddress = (id:number, username:string) =>
    axios.put(`/api/addresses/${id}/default`, null, {
        params: { username }
    });

