// src/api/order.ts
import {axios} from '../utils/request'

interface  ShippingAddress {
    name: string;
    phone: string;
    zipCode: string;//邮编
    address: string;
}
interface OrderData{
    cartItemIds: string[];
    shippingAddress: ShippingAddress;
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
