<template>
  <div class="recipe-detail-view">
    <div class="container">
      <!-- ローディング状態 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">レシピを読み込み中...</p>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" class="error-container">
        <h2 class="error-title">エラーが発生しました</h2>
        <p class="error-message">{{ error }}</p>
        <router-link to="/search" class="back-button">検索ページに戻る</router-link>
      </div>

      <!-- レシピ詳細情報 -->
      <div v-else-if="recipe" class="recipe-detail">
        <!-- ヘッダー -->
        <header class="detail-header">
          <router-link to="/search" class="back-link">← 検索ページに戻る</router-link>
          <h1 class="recipe-title">{{ recipe.title }}</h1>
        </header>

        <!-- メインコンテンツ -->
        <div class="detail-content">
          <!-- 左側: メイン画像 -->
          <div class="image-section">
            <img
              v-if="recipe.main_image"
              :src="recipe.main_image"
              :alt="recipe.title"
              class="main-image"
            />
            <div v-else class="no-image">画像なし</div>
          </div>

          <!-- 右側: レシピ情報 -->
          <div class="info-section">
            <!-- カテゴリー -->
            <div class="info-item">
              <span class="info-label">カテゴリー:</span>
              <span class="category-badge" :class="getCategoryClass(recipe.category)">
                {{ getCategoryName(recipe.category) }}
              </span>
            </div>

            <!-- 主な材料（タグ風） -->
            <div class="info-item">
              <span class="info-label">主な材料:</span>
              <div class="ingredients-tags">
                <span
                  v-for="(ingredient, index) in mainIngredientsList"
                  :key="index"
                  class="ingredient-tag"
                >
                  {{ ingredient }}
                </span>
              </div>
            </div>

            <!-- 食べ方 -->
            <div v-if="recipe.eating_method" class="info-item">
              <span class="info-label">食べ方:</span>
              <p class="eating-method">{{ recipe.eating_method }}</p>
            </div>

            <!-- 詳細な材料リスト（テーブル形式） -->
            <div v-if="ingredientsList.length > 0" class="info-item">
              <span class="info-label">材料（詳細）:</span>
              <table class="ingredients-table">
                <thead>
                  <tr>
                    <th>材料名</th>
                    <th>分量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ingredient, index) in ingredientsList" :key="index">
                    <td>{{ ingredient.name }}</td>
                    <td>{{ ingredient.amount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 作り方（調理手順） -->
            <div v-if="recipe.cooking_method" class="info-item">
              <span class="info-label">作り方:</span>
              <div class="cooking-method">
                <p
                  v-for="(step, index) in cookingMethodSteps"
                  :key="index"
                  class="cooking-step"
                >
                  {{ step }}
                </p>
              </div>
            </div>

            <!-- 元のレシピへのリンク -->
            <div v-if="recipe.detailUrl" class="info-item">
              <a
                :href="recipe.detailUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="detail-link-button"
              >
                元のレシピを見る →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

/**
 * レシピ詳細情報の型定義
 */
interface RecipeDetail {
  _id: string;
  title: string;
  main_image: string;
  main_ingredients: string;
  eating_method: string;
  cooking_method?: string;
  ingredients: Array<{ name: string; amount: string }> | string;
  category: string;
  detailUrl: string;
  scrapeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 材料情報の型定義
 */
interface Ingredient {
  name: string;
  amount: string;
}

/**
 * ルーターからIDパラメータを取得
 */
const route = useRoute();
const recipeId = computed(() => route.params.id as string);

/**
 * APIベースURL（環境変数から取得）
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * レシピデータ
 */
const recipe = ref<RecipeDetail | null>(null);

/**
 * ローディング状態
 */
const loading = ref(true);

/**
 * エラーメッセージ
 */
const error = ref<string | null>(null);

/**
 * 主な材料のリスト（カンマ区切り文字列を配列に変換）
 */
const mainIngredientsList = computed(() => {
  if (!recipe.value?.main_ingredients) return [];
  // カンマまたは日本語カンマで分割
  return recipe.value.main_ingredients
    .split(/[,、]/)
    .map((ing) => ing.trim())
    .filter((ing) => ing.length > 0);
});

/**
 * 詳細な材料リスト（配列形式または文字列形式を統一）
 */
const ingredientsList = computed<Ingredient[]>(() => {
  if (!recipe.value?.ingredients) return [];

  // 配列形式の場合
  if (Array.isArray(recipe.value.ingredients)) {
    return recipe.value.ingredients.filter(
      (ing) => ing && typeof ing === 'object' && ing.name && ing.amount
    ) as Ingredient[];
  }

  // 文字列形式の場合（後方互換性）
  if (typeof recipe.value.ingredients === 'string') {
    const lines = recipe.value.ingredients.split('\n');
    return lines
      .map((line) => {
        // "材料名：分量" または "材料名:分量" 形式をパース
        const match = line.match(/^(.+?)[：:]\s*(.+)$/);
        if (match) {
          return {
            name: match[1].trim(),
            amount: match[2].trim(),
          };
        }
        return null;
      })
      .filter((ing): ing is Ingredient => ing !== null);
  }

  return [];
});

/**
 * 作り方のステップリスト（改行で分割）
 */
const cookingMethodSteps = computed(() => {
  if (!recipe.value?.cooking_method) return [];
  // 改行で分割し、空行を除去
  return recipe.value.cooking_method
    .split('\n')
    .map((step) => step.trim())
    .filter((step) => step.length > 0);
});

/**
 * カテゴリー名を日本語で取得
 */
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    rice: 'ご飯',
    noodles: '麺',
    soup: '汁物',
    meat_vegetable: '肉・野菜',
    fish: '魚',
  };
  return categoryMap[category] || category;
};

/**
 * カテゴリーに応じたCSSクラスを取得
 */
const getCategoryClass = (category: string): string => {
  const classMap: Record<string, string> = {
    rice: 'category-rice',
    noodles: 'category-noodles',
    soup: 'category-soup',
    meat_vegetable: 'category-meat-vegetable',
    fish: 'category-fish',
  };
  return classMap[category] || 'category-default';
};

/**
 * レシピ詳細情報を取得
 */
const fetchRecipeDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId.value}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('レシピが見つかりませんでした');
      }
      throw new Error(`サーバーエラー: ${response.status}`);
    }

    const data = await response.json();
    recipe.value = data;
  } catch (err) {
    console.error('レシピ詳細の取得に失敗しました:', err);
    error.value = err instanceof Error ? err.message : 'レシピの読み込みに失敗しました';
  } finally {
    loading.value = false;
  }
};

/**
 * コンポーネントマウント時にレシピ詳細を取得
 */
onMounted(() => {
  fetchRecipeDetail();
});
</script>

<style scoped>
.recipe-detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ローディング状態 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 1.125rem;
}

/* エラー状態 */
.error-container {
  text-align: center;
  padding: 3rem 1rem;
}

.error-title {
  font-size: 1.5rem;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.error-message {
  color: #666;
  margin-bottom: 2rem;
}

.back-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5568d3;
}

/* レシピ詳細 */
.recipe-detail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.detail-header {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.back-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.recipe-title {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}

/* 画像セクション */
.image-section {
  width: 100%;
}

.main-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 8px;
}

/* 情報セクション */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.content-box {
  background-color: transparent;
  padding: 0;
  border: none;
}

/* カテゴリーバッジ */
.category-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.category-rice {
  background-color: #ff9800;
}

.category-noodles {
  background-color: #2196f3;
}

.category-soup {
  background-color: #4caf50;
}

.category-meat-vegetable {
  background-color: #f44336;
}

.category-fish {
  background-color: #00bcd4;
}

.category-default {
  background-color: #9e9e9e;
}

/* 材料タグ */
.ingredients-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ingredient-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 食べ方 */
.eating-method {
  color: #666;
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

/* 作り方 */
.cooking-method {
  margin-top: 0.5rem;
}

.cooking-step {
  color: #666;
  line-height: 1.8;
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.cooking-step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 6px;
  height: 6px;
  background-color: #667eea;
  border-radius: 50%;
}

/* 材料テーブル */
.ingredients-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.ingredients-table thead {
  background-color: #f5f5f5;
}

.ingredients-table th,
.ingredients-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.ingredients-table th {
  font-weight: 600;
  color: #333;
}

.ingredients-table td {
  color: #666;
}

.ingredients-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* 詳細リンクボタン */
.detail-link-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: center;
}

.detail-link-button:hover {
  background-color: #5568d3;
}
</style>

