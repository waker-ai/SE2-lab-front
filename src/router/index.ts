import {createRouter, createWebHashHistory} from "vue-router"
import Order from "../views/Cart/Order.vue";
import Cart from "../views/Cart/Cart.vue";
import AdvertisementList from '../views/AdvertiseMent/AdvertisementList.vue'
import AdvertisementEdit from '../views/AdvertiseMent/AdvertisementEdit.vue'
import OrderHistory from "../views/Order/OrderHistory.vue";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        component: () => import('../views/user/Login.vue'),
        meta: {title: '用户登录'}
    },
        {
        path: '/register',
        component: () => import('../views/user/Register.vue'),
        meta: {title: '用户注册'}
    },{
        path:'/MemberCharge',
        component:()=>import('../views/MemberShip/MemberCharge.vue'),
        meta:{title:'会员充值'}
        },{
            path:'/MemberDetail',
            component:()=>import('../views/MemberShip/MemberDetail.vue'),
            meta:{title:'会员详情'}
        },
        {
            path:'/MemberList',
            component:()=>import('../views/MemberShip/MemberList.vue'),
            meta:{title:'会员列表'}
        },
        {
        path: '/home',
        redirect: '/dashboard',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/user/Dashboard.vue'),
                meta: {title: '个人信息'}
            },
        ]
    }, {
            path: '/home',
            redirect: '/coupon',
            component: () => import('../views/Home.vue'),
            children: [
                {
                    path: '/coupon',
                    name: 'CouponList',
                    component: () => import('../views/Coupon/CouponList.vue'),
                    meta: { title: '优惠券列表' }
                }
            ]
        },{
            path: '/home',
            redirect: '/couponedit',
            component: () => import('../views/Home.vue'),
            children: [
                {
                    path: '/couponedit',
                    name: 'CouponEdit',
                    component: () => import('../views/Coupon/CouponEdit.vue'),
                    meta: { title: '添加优惠卷' }
                }
            ]
        },
        {
        path: '/home',
        redirect: '/mainpage',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/mainpage',
                name: 'MainPage',
                component: () => import('../views/MainPage/MainPage.vue'),
                meta: {title: '个人信息'}
            },
        ]
},{
    path:'/createproduct',
    component:()=>import('../views/Product/CreateProduct.vue') ,
    meta:{
        title:'创建商品',
    },
    },{
        path:'/products/:id',
        name:'productDetail',
        component:()=>import('../views/Product/ProductDetail.vue'),
        meta:{title:'商品详情'}
    }, {
        path:'/products',
        name:'ProductList',
        component:()=>import('../views/MainPage/MainPage.vue'),
        meta:{title:'商品列表'}
        },{
        path:'/admin/products',
        name:'AdminProductManagement',
        component:()=>import('../views/Product/AdminProductManagement.vue')
    }, {
            path: '/cart',
            name: 'Cart',
            component: Cart
        },
        {
            path: '/order',
            name: 'Order',
            component: Order
        },
        {
            path: '/orderHistory',
            name: 'OrderHistory',
            component: OrderHistory,
            meta: {title: '历史订单'}
        },
        {
            path: '/order/:id',
            name: 'OrderDetail',
            component: () => import("../views/Order/OrderDetail.vue"),
            meta: {title: '订单详情'}
        },
        {
            path: '/review',
            name: 'ReviewPage',
            component: () => import('../views/Product/ReviewPage.vue'),
            meta: { title: '商品评价' }
        },
        {
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    },{
            path: '/advertisement',
            name: 'AdvertisementList',
            component: AdvertisementList
        },
        {
            path:'/HotProductsList',
            name:'HotProductsList',
            component:()=>import('../views/HotProducts/HotProductsList.vue'),
            meta:{title:'热销商品'}
        },
        {
            path: '/advertisement/edit',
            name: 'AdvertisementEdit',
            component: AdvertisementEdit
        },{
            path: '/addressManager',
            name: 'addressManager',
            component: () => import("../views/Address/AddressManager.vue"),
            meta: {title: '管理收货地址'}
        },
        {
        path :'/search',
        name:'SearchResult',
        component:()=>import('../views/Search/SearchResult.vue'),
        }
    ]
})

router.beforeEach((to, _, next) => {
    const token: string | null = sessionStorage.getItem('username');
    const role: string | null = sessionStorage.getItem('role')

    if (to.meta.title) {
        document.title = to.meta.title
    }

    if (token) {
        if (to.meta.permission) {
            if (to.meta.permission.includes(role!)) {
                next()
            } else {
                next('/404')
            }
        } else {
            next()
        }
    } else {
        if (to.path === '/login') {
            next();
        } else if (to.path === '/register') {
            next()
        } else {
            next('/login')
        }
    }
})

export {router}
