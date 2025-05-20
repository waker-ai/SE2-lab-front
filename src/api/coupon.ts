import {axios} from '../utils/request'
import {Member}from './membership'

export interface Coupon {
    id: number
    username: string
    discountAmount: number
    minCost: number
    startDate: string
    validTime: number
    endDate: string
    used: boolean
}

export interface CouponVO {
    discountAmount: number
    minCost: number
    validTime: number
    used: boolean
}

export interface CouponAssignRequest {
    members: Member[]
    couponVO: CouponVO
}

export const getCouponList = (username: string) => axios.get(`/api/coupons?username=${username}`)

export const getAvailableCoupons= (username: string) => axios.get(`/api/coupons/available?username=${username}`)

export const createCoupon = (data: CouponAssignRequest) => axios.post('/api/coupons', data)

export const applyCoupon = (data: Coupon) => axios.put('/api/coupons/apply', data)