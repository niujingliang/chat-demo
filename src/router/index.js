import { createRouter, createWebHistory } from 'vue-router';

import Login from '../pages/Login';
import Chat from '../pages/Chat';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Chat,
        },
        {
            path: '/login',
            component: Login,
        }
    ]
});
export default router;
