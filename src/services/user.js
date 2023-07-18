import { socket } from '../utils/socket';

export function onUserChange(callback) {
    
}

let isObserve = false;
export default initUserSocket() {
    if(isObserve) return;
    isObserve = true;

    socket.on("msg", (data) => {
        // switch(data.type) {
    
        // }
        // socket.emit("msg", "你好服务器");
        // //监听浏览器通过msg事件发送的信息
        // console.log(data); //你好浏览器
    });
};

