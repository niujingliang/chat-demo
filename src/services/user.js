const userStore = [];

export default initUserSocket(socket, onUserChage) {
    socket.on('msg', data => {
        if(data?.type !== 'user') return;

        if (data.state === 'online') {
            let serverUsers = data.users;
            for (let u of serverUsers) {
                if (!u) continue;
                let index = userStore.findIndex(user => user.username === u?.username);
                if (index === -1) {
                    userStore.push(u);
                } else {
                    userStore[index] = u;
                }
            }
            onUserChange([...userStore]);
        } else if (data.state === 'offline') {
            let _users = users.value;
            let serverUsers = data.users;
            for (let u of serverUsers) {
                let index = userStore.findIndex(user => user.username === u?.username);
                if (index >= 0) {
                    userStore.splice(index, 1);
                }
            }
            onUserChange([...userStore]);
        }
    });
};

