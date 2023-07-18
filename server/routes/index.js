var Router = require('koa-router');

var router = new Router({
    prefix: '/api'
});

// 登录接口
router.post('/login', (ctx) => {
    let { username } = ctx.request.body
    
    let session = ctx.session
    session.isLogin = true
    session.username = username
    ctx.body = {
        code: 0,
        message: 'SUCCESS',
        username
    }
})

module.exports = router