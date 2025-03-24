import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    define: {
        global: 'window'
    },
  server:{
    proxy:{
      '/factoring/users/api':{
        target:'http://localhost:8082/factoring/users',
        changeOrigin:true,
        secure:false,
        rewrite:(path)=>path.replace(/^\/api/,'')
      }, '/factoring/api': {
        target: 'http://localhost:8081/factoring',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
     '/factoring/contrat': {
      target: 'http://localhost:8083/factoring/contrat',
      changeOrigin: true,
      secure: false,

      rewrite: (path) => path.replace(/^\/api/, '')
    }
    }
  },
  plugins: [react()],
})
