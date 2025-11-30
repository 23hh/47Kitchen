import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import SearchView from '../views/SearchView.vue';
import RecipeDetailView from '../views/RecipeDetailView.vue';

/**
 * ルート設定
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '日本全国郷土料理レシピ検索',
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView,
    meta: {
      title: '材料から探す',
    },
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: RecipeDetailView,
    meta: {
      title: 'レシピ詳細',
    },
  },
];

/**
 * Vue Routerインスタンスを作成
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * ルート変更時にページタイトルを更新
 */
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || '日本全国郷土料理レシピ検索';
  next();
});

export default router;

