import {createRouter, createWebHashHistory} from "vue-router"
import Order from "../views/Cart/Order.vue";
import Cart from "../views/Cart/Cart.vue";

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
    }, {
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
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }]
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
