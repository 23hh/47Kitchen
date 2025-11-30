<template>
  <div class="search">
    <div class="container">
      <header class="header">
        <h1 class="page-title">材料から探す</h1>
        <router-link to="/" class="back-link">← ホームに戻る</router-link>
      </header>

      <div class="content">
        <!-- 材料選択セクション -->
        <section class="ingredients-section">
          <h2 class="section-title">材料を選択してください</h2>
          <div class="ingredients-list" v-if="ingredients.length > 0">
            <label
              v-for="ingredient in ingredients"
              :key="ingredient"
              class="ingredient-checkbox"
            >
              <input
                type="checkbox"
                :value="ingredient"
                v-model="selectedIngredients"
                @change="searchRecipes"
              />
              <span>{{ ingredient }}</span>
            </label>
          </div>
          <div v-else class="loading">材料リストを読み込み中...</div>
          
        </section>

        <!-- レシピリストセクション -->
        <section class="recipes-section">
          <h2 class="section-title">検索結果</h2>
          <div v-if="loading" class="loading">検索中...</div>
          <div v-else-if="recipes.length === 0 && !loading" class="no-results">
            条件に一致するレシピが見つかりませんでした
          </div>
          <div v-else class="recipes-grid">
            <div
              v-for="recipe in recipes"
              :key="recipe._id"
              class="recipe-card"
            >
              <img
                v-if="recipe.main_image"
                :src="recipe.main_image"
                :alt="recipe.title"
                class="recipe-image"
              />
              <div class="recipe-info">
                <h3 class="recipe-title">{{ recipe.title }}</h3>
                <p class="recipe-ingredients">{{ recipe.main_ingredients }}</p>
                <span class="recipe-category">{{ recipe.category }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * 材料選択・レシピ検索ページコンポーネント
 */

// APIベースURL（環境変数から取得）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 状態管理
const ingredients = ref<string[]>([]);
const selectedIngredients = ref<string[]>([]);
const recipes = ref<any[]>([]);
const loading = ref(false);

/**
 * 材料リストを取得
 */
const fetchIngredients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/ingredients`);
    const data = await response.json();
    ingredients.value = data.ingredients || [];
  } catch (error) {
    console.error('材料リストの取得に失敗しました:', error);
  }
};

/**
 * レシピを検索
 */
const searchRecipes = async () => {
  if (selectedIngredients.value.length === 0) {
    recipes.value = [];
    return;
  }

  loading.value = true;
  try {
    const ingredientsParam = selectedIngredients.value.join(',');
    const response = await fetch(
      `${API_BASE_URL}/recipes/search?ingredients=${encodeURIComponent(ingredientsParam)}`
    );
    const data = await response.json();
    recipes.value = data || [];
  } catch (error) {
    console.error('レシピ検索に失敗しました:', error);
    recipes.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * コンポーネントマウント時に材料リストを取得
 */
onMounted(() => {
  fetchIngredients();
});
</script>

<style scoped>
.search {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  color: #333;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.ingredients-section,
.recipes-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 600px;
  overflow-y: auto;
}

.ingredient-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ingredient-checkbox:hover {
  background-color: #f0f0f0;
}

.ingredient-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.recipe-info {
  padding: 1rem;
}

.recipe-title {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.recipe-ingredients {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.recipe-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #667eea;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
}

.loading,
.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

