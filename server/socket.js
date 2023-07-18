const { addUser, removeUser, getAllUser } = require('./services/user');
const { MessageType, UserState } = require('./config');

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
            type: MessageType.USER,
            state: UserState.ON_LINE,
            username,
            users: getAllUser(),
        })

        let user = addUser(username, socket.id);
        // 通知其他用户上线
        socket.broadcast.emit('msg', {
            type: MessageType.USER,
            state: UserState.ON_LINE,
            username,
            users: [user],
        });
        
        //监听connection（用户连接）事件，socket为用户连接的实例
        socket.on('disconnect', () => {
            let user = removeUser(socket.id)
            socket.broadcast.emit('msg', {
                type: MessageType.USER,
                username,
                state: UserState.OFF_LINE,
                users: [user]
            });
        });

        socket.on('msg', (data) => {
            if(data.type === MessageType.MESSAGE) {
                io.to(data.to).emit('msg', {
                    type: MessageType.MESSAGE,
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