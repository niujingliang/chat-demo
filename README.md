# chat-demo

    简易聊天功能：
    1、登录页面（http://localhost:8080/login）（因为是简易项目，这里只需要填入一个不重复用户名就行）
    2、登录之后跳转主页，可以看到其他登录的在线用户（模拟其他用户：启动其他浏览器，按照同样的操作登录）
    3、选中一个在线用户，发送消息


### 选用的主要技术框架
前端：Vue + vue-router + socket.io-client + TDesign
后端：Node + koa + socket.io

---
> 快速启动项目：npm run preview 该命令等于 build + 服务启动

## 项目初始化
```
npm install
```

### 编译运行（开发环境）
```
npm run serve
```

### 编译（生产环境）
```
npm run build
```

### 启动Web服务
```
npm run start
```
