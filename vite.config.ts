import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// Element UI 自动导入支持
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        })],
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/upload': {
                target: 'http://localhost:8080', // 你的 Spring Boot 服务地址
                changeOrigin: true,
                secure: false,
                rewrite:(path)=>path.replace(/^\upload/,'/upload')
            },
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    base: './'
})
