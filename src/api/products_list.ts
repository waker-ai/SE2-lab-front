import {axios} from '../utils/request'
export const getProductsBySales=(page: number, size: number)=>{
    return axios.get('./api/products/by-sales',{params:{page,size}})
        .then(res=>{
            return res
        })
}
export const getProductsByScore=(page: number, size: number)=>{
    return axios.get('./api/products/by-score',{params:{page,size}})
       .then(res=>{
            return res
        })
}