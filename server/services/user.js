const onlineUsers = [/* { username, socketid} */]; // demo，临时存储在内存中

function getAllUser() {
    return onlineUsers;
}

function addUser(username, socketid) {
    if(!username) return;
    
    let user = onlineUsers.find(user => user.username === username); 
    if(!user) {
        user = { username, socketid };
        onlineUsers.push(user);
    } else {
        user.socketid = socketid;
    }
    return user; 
}


function removeUser(socketid) {
    let index = onlineUsers.findIndex(user => user.socketid === socketid);
    let user = onlineUsers[index];
    if(index >= 0) onlineUsers.splice(index, 1);
    return user;
}

module.exports = {
    addUser,
    removeUser,
    getAllUser,
}
