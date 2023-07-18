const { addUser, removeUser, getAllUser } = require('./services/user');

function attachSocket(app) {
    const server = require('http').createServer(app.callback());
    const io = require('socket.io')(server);
    io.use((socket, next) => {
        const ctx = app.createContext(socket.request, socket.request.res);
        socket.session = ctx.session;
        next();
    });
    io.on('connection', (socket) => {
        let username = socket?.session?.username

        // 初始化所有在线用户
        socket.emit('msg', {
            type: 'user',
            state: 'online',
            username,
            users: getAllUser(),
        })

        let user = addUser(username, socket.id);
        // 通知其他用户上线
        socket.broadcast.emit('msg', {
            type: 'user',
            state: 'online',
            username,
            from: 'broadcast',
            users: [user],
        });
        
        //监听connection（用户连接）事件，socket为用户连接的实例
        socket.on('disconnect', () => {
            let user = removeUser(socket.id)
            socket.broadcast.emit('msg', {
                type: 'user',
                state: 'offline',
                from: 'broadcast',
                username,
                users: [user]
            });
        });

        socket.on('msg', (data) => {
            console.log('======>server', data);
            if(data.type === 'message') {
                io.to(data.to).emit('msg', {
                    type: 'message',
                    from: data.from,
                    to: data.to,
                    content: data.content,
                });
            }
        })
    });
    return server;
}

module.exports = {
    attachSocket
}