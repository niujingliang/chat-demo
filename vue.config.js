const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy:{
        '/api':{
            target: 'http://127.0.0.1:3000', //代理地址，这里设置的地址会代替axios中设置的baseURL
            changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
            ws: true, // proxy websockets
            pathRewrite: {
                '^/api': '/api' 
            }
        },
        '/socket.io':{
          target: 'http://127.0.0.1:3000', //代理地址，这里设置的地址会代替axios中设置的baseURL
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
          ws: true, // proxy websockets
          pathRewrite: {
            '^/socket.io': '/socket.io' 
          }
        }
    }
  }
})
