const path = require("path")
const Koa = require("koa")
const serve = require('koa-static')
const send = require('koa-send')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser');
const router = require('./routes/index')

const { apiWhiteList, pageWhiteList } = require('./config');

const app = new Koa()
app.use(bodyParser())

app.keys = ['chat-demo']
app.use(session({
    key: "__session_id__",
    maxAge: 1000 * 60 * 60 * 2, // 2个小时
    rolling: true
}, app));

app.use(async (ctx, next) => {
    let pathname = ctx.path

    // 静态资源 跳过鉴权
    if(/^\/(js|img|css|fonts)\/.*$/.test(pathname)) {
        await next()
        return
    }
    if(['/favicon.ico'].indexOf(pathname) > -1) {
        await next()
        return
    }


    let session = ctx.session

    // 接口 未登录时接口直接报错
    if(pathname.startsWith('/api/')) {
        if(!session.isLogin && apiWhiteList.indexOf(pathname) === -1) {
            ctx.status = 403
            ctx.body = '用户未登录'
        } else {
            await next()
        }
        return
    }

    // 登录页 如果已经登录，访问登录页面时直接跳转到主页
    if(pageWhiteList.indexOf(pathname) > -1) {
        if(session.isLogin) {
            ctx.status = 302
            ctx.redirect('/') // 主页
        } else {
            await next()
        }
    } else {
        // 非登录页 未登录跳转到登录页，已登录时直接访问
        if(!session.isLogin) {
            ctx.status = 302;
            ctx.redirect('/login')
        } else {
            await next()
        }
    }
})

app.use(router.routes())

app.use(async (ctx, next) => {
    try {
        await next()
        if (ctx.status === 404) {
            await send(ctx, './dist/index.html', { root: path.resolve(__dirname, '../') })
        }
    } catch (err) {
        ctx.status = 200
        await send(ctx, './dist/index.html', { root: path.resolve(__dirname, '../') })
    }
})
app.use(serve(path.join(__dirname, '../dist/')))

app.on("error", (err) => {
    console.error("The application err is ", err)
})

const server = require('./socket').attachSocket(app);
const host = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 3000
server.listen(port, host, () => {
    console.log(`server is starting at ip ${host} port ${port}`)
})
