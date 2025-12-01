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
      title: 'ホーム',
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
 * 形式: "ページ名 - 47 Kitchen"
 */
router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title as string || 'ホーム';
  document.title = `${pageTitle} - 47 Kitchen`;
  next();
});

export default router;

