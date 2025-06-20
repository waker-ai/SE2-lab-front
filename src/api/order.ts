// src/api/order.ts
import {axios} from '../utils/request'

interface OrderData{
    cartItemIds: string[];
    shippingAddressId: number;
    selectedCouponId: number | null;
    paymentMethod: string;
}
interface  PaymentNotification {
    orderId: string;
    paymentMethod: string;
    paymentTime: string;
    tradeNo: string;
    totalAmount: number;
}
export const submitOrder = (orderData: OrderData) => {
    return axios.post<{
        code: string;
        data: {
            orderId: string;
            username: string;
            totalAmount: number;
            paymentMethod: string;
            createTime: string;
            status: string;
        };
        msg: string | null;
    }>('/api/cart/checkout', orderData)
}

export const initiatePayment = (orderId: string) => {
    return axios.post<{
        code: string;
        data: {
            paymentForm: string;
            orderId: string;
            totalAmount: number;
            paymentMethod: string;
        };
        msg: string | null;
    }>(`/api/orders/${orderId}/pay`)
}

export const handlePaymentNotification = (notificationData: PaymentNotification) => {
    return axios.post('/api/orders/notify', notificationData)
}

export interface OrderVO {
    orderId: number;
    userId: number;
    totalAmount: number;
    paymentMethod: string;
    orderStatus: string;
    createTime: string;
}

export const getHistoryOrders = () => {
    return axios.get<{
        code: string;
        data: OrderVO[];
        msg: string | null;
    }>('api/orders/history')
}

export interface OrderDetailVO {
    orderId: number
    createTime: string
    paymentMethod: string
    status: string
    receiverName: string
    receiverPhone: string
    items: {
        productId: number
        productName: string
        quantity: number
        price: number
        reviewed: boolean
    }[]
}

export const getOrderDetail = (orderId: number) => {
    return axios.get<{
        code: string;
        data: OrderDetailVO;
        msg: string | null;
    }>(`/api/orders/${orderId}`)
}
