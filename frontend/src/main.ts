import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

/**
 * アプリケーションのエントリーポイント
 */
const app = createApp(App);

// Vue Routerをアプリケーションに登録
app.use(router);

// アプリケーションをマウント
app.mount('#app');

