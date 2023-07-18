<template>
    <div class="login-container">
        <div class="login-box">
            <t-input v-model.trim="username" autocomplete="off" placeholder="账号">
            </t-input>
            <t-button type="primary" class="login-btn" @click="login">登 录</t-button>
        </div>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

export default defineComponent({
    setup() {
        const username = ref('');
        const router = useRouter();

        const login = async () => {
            if(!username.value) {
                MessagePlugin.warning('请输入账号！')
                return;
            }
            let res = await axios.post('/api/login', { username: username.value });
            if(res?.data?.code === 0) {
                router.replace('/')
            } else {
                MessagePlugin.error(res?.data?.code || "服务异常，请稍后重试")
            }
        }

        return {
            username,
            login,
        }
    }
});
</script>

<style lang="less">
.login-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
  .login-box {
    border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #f5f5f5;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 5px #cac6c6;

    .login-btn {
      margin: 35px 0 10px 0;
      width: 100%;
    }
  }
}
</style>
