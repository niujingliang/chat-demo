<template>
    <div class="chat-container">
        <div class="chat-box">
            <t-layout style="height: 100%">
                <t-aside style="border-right: solid 1px #c2c2c2">
                    <t-header class="list-header">
                        列表
                    </t-header>
                    <t-content class="list-content">
                        <div v-for="user in users" :key="user.username"
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
                        <t-textarea v-model="messageText" style= "height: 100%" placeholder="请输入内容"></t-textarea>
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

export default defineComponent({
    setup() {
        // 在线用户列表
        let users = ref([]);
        // 选中的聊天对象
        let selUser = ref(null);

        let unreadCount = ref({ /* [socketid]: 0 */ })

        // 当前用户的SocketId
        let currentSocketId = ref('');

        let messageText = ref('');
        // 所有用户的相关的消息
        let fullMessages = ref({ /* socketid: [message] */});
        let messages = computed(() => {
            let socketid = selUser.value?.socketid;
            return fullMessages.value[socketid] || [];
        });
        
        // 显示消息
        function addMessage(data) {
            let fullMsg = fullMessages.value;
            let socketid = currentSocketId.value === data.from ? data.to : data.from;
            fullMsg[socketid] = fullMsg[socketid] || [];
            fullMsg[socketid].push(data);
            fullMessages.value = fullMsg;
        }
        
        let socket = connectSocket();
        socket.on('connect', () => {
            const socketId = socket.id;
            currentSocketId.value = socketId;
        });
        socket.on('msg', data => {
            switch (data.type) {
                case 'user':
                    if (data.state === 'online') {
                        let _users = users.value;
                        let serverUsers = data.users;
                        for (let u of serverUsers) {
                            if (!u) continue;
                            let index = _users.findIndex(user => user.username === u?.username);
                            if (index === -1) {
                                _users.push(u);
                            } else {
                                _users[index] = u;
                            }
                        }
                        users.value = [..._users];
                    } else if (data.state === 'offline') {
                        let _users = users.value;
                        let serverUsers = data.users;
                        for (let u of serverUsers) {
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
                        users.value = [..._users];
                    }
                    break;
                case 'message':
                    addMessage(data);
                    if(data.to !== selUser.value.socketid) {
                        // eslint-disable-next-line no-case-declarations
                        const count = unreadCount.value[data.from] || 0; 
                        unreadCount.value[data.from] = count + 1;
                    } 
                    break;
            }
        });
        onUnmounted(() => {
            socket.disconnect();
        });

        function handleUserSel(user) {
            unreadCount.value[user.socketid] = 0;
            selUser.value = user;
        }
        
        function handleSend() {
            let message = {
                from: currentSocketId.value,
                to: selUser.value?.socketid,
                content: messageText.value
            };
            socket.emit('msg', {
                type: 'message',
                ...message
            });
            messageText.value = '';
            addMessage(message);
        }  
        
        return {
            users,
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
