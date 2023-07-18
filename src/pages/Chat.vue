<template>
    <div class="chat-container">
        <div class="chat-box">
            <t-layout style="height: 100%">
                <t-aside style="border-right: solid 1px #c2c2c2">
                    <t-header class="list-header">
                        在线用户
                    </t-header>
                    <t-content class="list-content">
                        <div v-for="user in onlineUsers" :key="user.username"
                            class="user-list"
                            :class ="{'t-card-sel': user.username === selUser?.username }"
                            @click="(e) => handleUserSel(user)">
                            <t-badge :count="unreadCount[user.socketid]">
                                <t-avatar size="large" image="https://tdesign.gtimg.com/site/avatar-boy.jpg"/>
                            </t-badge>
                            <div class="user-name">{{ user.username }}</div>
                        </div>
                    </t-content>
                </t-aside>

                <t-layout>
                    <t-header class="list-header">
                        {{ selUser?.username }}
                    </t-header>
                    <t-content class="list-content">
                        <div v-for="(msg,index) in messages" :key="index"
                            class="message-box"
                            :class="{ me: msg.from === currentSocketId}">
                            <t-avatar class="msg-avatar" size = "large" image = "https://tdesign.gtimg.com/site/avatar-boy.jpg"></t-avatar>
                            <div class="msg-content">{{ msg.content }}</div>
                        </div>
                        <div v-if="!selUser" style="color: #333;text-align: center;margin-top: 50%;">
                            请选择聊天用户
                        </div>
                    </t-content>
                    <t-footer v-if="selUser" class="send-box">
                        <t-textarea v-model="messageText"
                            style= "height: 100%"
                            placeholder="请输入内容"
                            @keydown="(value, context) => {
                                if(context?.e?.keyCode === 13) {
                                    handleSend();
                                }
                            }"
                        ></t-textarea>
                        <t-button @click="handleSend">发送</t-button>
                    </t-footer>
                </t-layout>
            </t-layout>
        </div>
    </div>
</template>

<script>
import {defineComponent, ref, onUnmounted, computed} from 'vue';
import connectSocket from '../utils/socket';
import { MessageType, UserState } from '../config'

export default defineComponent({
    setup() {
        // 在线用户列表
        let onlineUsers = ref([]);
        // 选中的聊天对象
        let selUser = ref(null);
        // 未读数量
        let unreadCount = ref({ /* [socketid]: 0 */ })
        // 当前用户的SocketId
        let currentSocketId = ref('');
        // 发送消息的内容
        let messageText = ref('');
        // 所有用户的相关的消息
        let fullMessages = ref({ /* socketid: [message] */});

        // 当前选中聊天用户的消息
        let messages = computed(() => {
            let socketid = selUser.value?.socketid;
            if(!socketid) return [];
            return fullMessages.value[socketid] || [];
        });

        // 显示消息
        function setMessage(data) {
            const {from, to} = data;
            let fullMsg = fullMessages.value;
            let socketid = currentSocketId.value === from ? to : from;
            fullMsg[socketid] = fullMsg[socketid] || [];
            fullMsg[socketid].push(data);
            fullMessages.value = fullMsg;

            // 是否是当前正在聊天的用户窗口
            let isCurrentChatUser = selUser.value 
                                    && (
                                        from === selUser.value.socketid
                                        || to === selUser.value.socketid
                                    ); 
            if(!isCurrentChatUser) {
                const count = unreadCount.value[from] || 0; 
                unreadCount.value[from] = count + 1;
            }
        }

        // 显示在线用户列表
        function setOnlineUsers(users = []) {
            let _users = onlineUsers.value;
            for (let u of users) {
                if (!u) continue;
                let index = _users.findIndex(user => user.username === u?.username);
                if (index === -1) {
                    _users.push(u);
                } else {
                    _users[index] = u;
                }
            }
            onlineUsers.value = [..._users];
        }

        // 设置下线用户信息
        function setOfflineUsers(users = []) {
            let _users = onlineUsers.value;
            for (let u of users) {
                let index = _users.findIndex(user => user.username === u?.username);
                if (index >= 0) {
                    _users.splice(index, 1);
                }
                delete fullMessages.value[u.socketid];
                delete unreadCount.value[u.socketid];
                if(u.socketid === selUser.value?.socketid) {
                    selUser.value = null;
                }
            }
            onlineUsers.value = [..._users];
        }
        
        let socket = connectSocket();
        socket.on('connect', () => {
            const socketId = socket.id;
            currentSocketId.value = socketId;
        });
        socket.on('msg', data => {
            switch (data.type) {
                case MessageType.USER:
                    if (data.state === UserState.ON_LINE) {
                        setOnlineUsers(data.users);
                    } else if (data.state === UserState.OFF_LINE) {
                        setOfflineUsers(data.users);
                    }
                    break;
                case MessageType.MESSAGE:
                    setMessage(data);
                    break;
            }
        });
        onUnmounted(() => {
            socket.disconnect();
        });


        // 选中用户事件
        function handleUserSel(user) {
            unreadCount.value[user.socketid] = 0;
            selUser.value = user;
        }
        
        // 发送消息事件
        function handleSend() {
            let message = {
                from: currentSocketId.value,
                to: selUser.value?.socketid,
                content: messageText.value
            };
            socket.emit('msg', {
                type: MessageType.MESSAGE,
                ...message
            });
            messageText.value = '';
            setMessage(message);
        }  
        
        return {
            onlineUsers,
            selUser,
            handleUserSel,
             
            messageText,
            handleSend,
            currentSocketId,
            messages,
            unreadCount
        };
    }
})
</script>

<style lang="less">
@import "./chat.less";
</style>
