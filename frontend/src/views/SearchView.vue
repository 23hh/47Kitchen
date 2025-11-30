<template>
  <div class="search-view">
    <div class="container">
      <header class="header">
        <h1 class="page-title">材料から探す</h1>
        <router-link to="/" class="back-link">← ホームに戻る</router-link>
      </header>

      <div class="content">
        <!-- 左側: 材料選択エリア -->
        <aside class="ingredients-panel">
          <h2 class="panel-title">材料を選択</h2>
          
          <!-- 材料リスト -->
          <div v-if="loadingIngredients" class="loading">材料リストを読み込み中...</div>
          <div v-else-if="ingredients.length === 0" class="empty">材料が見つかりませんでした</div>
          <div v-else class="ingredients-container">
            <!-- チェックボックス形式 -->
            <div class="ingredients-checkbox-list">
              <label
                v-for="ingredient in ingredients"
                :key="ingredient"
                class="ingredient-item"
                :class="{ 'selected': isSelected(ingredient) }"
              >
                <input
                  type="checkbox"
                  :value="ingredient"
                  v-model="selectedIngredients"
                />
                <span class="ingredient-name">{{ ingredient }}</span>
              </label>
            </div>
          </div>

          <!-- 検索ボタン -->
          <button
            @click="handleSearch"
            :disabled="selectedIngredients.length === 0 || loading"
            class="search-button"
          >
            {{ loading ? '検索中...' : 'この材料で検索' }}
          </button>

          <!-- 選択された材料の表示 -->
          <div v-if="selectedIngredients.length > 0" class="selected-info">
            <p class="selected-count">
              選択中: {{ selectedIngredients.length }}個
            </p>
          </div>
        </aside>

        <!-- 右側: レシピリストエリア -->
        <main class="recipes-panel">
          <h2 class="panel-title">検索結果</h2>
          
          <div v-if="loading" class="loading">検索中...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else-if="recipes.length === 0 && hasSearched" class="no-results">
            <p>条件に一致するレシピが見つかりませんでした</p>
            <p class="hint">別の材料を選択してみてください</p>
          </div>
          <div v-else-if="recipes.length === 0" class="empty-state">
            <p>材料を選択して「この材料で検索」ボタンをクリックしてください</p>
          </div>
          <div v-else class="recipes-grid">
            <router-link
              v-for="recipe in recipes"
              :key="recipe._id"
              :to="`/recipes/${recipe._id}`"
              class="recipe-card"
            >
              <!-- レシピ画像 -->
              <div class="recipe-image-wrapper">
                <img
                  v-if="recipe.main_image"
                  :src="recipe.main_image"
                  :alt="recipe.title"
                  class="recipe-image"
                  @error="handleImageError"
                />
                <div v-else class="recipe-image-placeholder">
                  画像なし
                </div>
              </div>

              <!-- レシピ情報 -->
              <div class="recipe-content">
                <h3 class="recipe-title">{{ recipe.title }}</h3>
                <p class="recipe-main-ingredients">
                  {{ recipe.main_ingredients }}
                </p>
                <div class="recipe-footer">
                  <span class="recipe-category" :class="`category-${recipe.category}`">
                    {{ getCategoryLabel(recipe.category) }}
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * 材料選択・レシピ検索ページコンポーネント
 * 
 * 機能:
 * - 材料リストの取得と表示
 * - 材料の選択（チェックボックス）
 * - 選択した材料でレシピ検索
 * - 検索結果の表示
 */

// APIベースURL（環境変数から取得）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 状態管理
const ingredients = ref<string[]>([]); // 材料リスト
const selectedIngredients = ref<string[]>([]); // 選択された材料
const recipes = ref<any[]>([]); // 検索結果のレシピリスト
const loadingIngredients = ref(false); // 材料リスト読み込み中
const loading = ref(false); // レシピ検索中
const error = ref<string>(''); // エラーメッセージ
const hasSearched = ref(false); // 検索を実行したかどうか

/**
 * 材料が選択されているか確認
 * @param ingredientName 材料名
 * @returns 選択されている場合true
 */
const isSelected = (ingredientName: string): boolean => {
  return selectedIngredients.value.includes(ingredientName);
};

/**
 * 材料リストを取得
 * GET /recipes/ingredients エンドポイントを呼び出し
 */
const fetchIngredients = async () => {
  loadingIngredients.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/ingredients`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    ingredients.value = data.ingredients || [];
  } catch (err) {
    console.error('材料リストの取得に失敗しました:', err);
    error.value = '材料リストの取得に失敗しました';
    ingredients.value = [];
  } finally {
    loadingIngredients.value = false;
  }
};

/**
 * レシピを検索
 * GET /recipes/search?ingredients=... エンドポイントを呼び出し
 */
const handleSearch = async () => {
  if (selectedIngredients.value.length === 0) {
    return;
  }

  loading.value = true;
  error.value = '';
  hasSearched.value = true;

  try {
    // 選択された材料をカンマ区切りで結合
    const ingredientsParam = selectedIngredients.value.join(',');
    
    // APIリクエスト
    const response = await fetch(
      `${API_BASE_URL}/recipes/search?ingredients=${encodeURIComponent(ingredientsParam)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    recipes.value = data || [];
  } catch (err) {
    console.error('レシピ検索に失敗しました:', err);
    error.value = 'レシピ検索に失敗しました。もう一度お試しください。';
    recipes.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * 画像読み込みエラー処理
 * @param event エラーイベント
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  // プレースホルダーを表示する処理はCSSで対応
};

/**
 * カテゴリーラベルを取得
 * @param category カテゴリーコード
 * @returns カテゴリーの日本語ラベル
 */
const getCategoryLabel = (category: string): string => {
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
 * コンポーネントマウント時に材料リストを取得
 */
onMounted(() => {
  fetchIngredients();
});
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
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
  grid-template-columns: 350px 1fr;
  gap: 2rem;
}

/* 左側: 材料選択パネル */
.ingredients-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.ingredients-container {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.ingredients-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.ingredient-item:hover {
  background-color: #f8f9fa;
}

.ingredient-item.selected {
  background-color: #e8f0fe;
  border-color: #667eea;
}

.ingredient-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.ingredient-name {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
}

.search-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selected-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.selected-count {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

/* 右側: レシピリストパネル */
.recipes-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.recipe-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
  position: relative;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.875rem;
  background-color: #f5f5f5;
}

.recipe-content {
  padding: 1rem;
}

.recipe-title {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-main-ingredients {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-category {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.category-rice {
  background-color: #f59e0b;
}

.category-noodles {
  background-color: #3b82f6;
}

.category-soup {
  background-color: #10b981;
}

.category-meat_vegetable {
  background-color: #ef4444;
}

.category-fish {
  background-color: #06b6d4;
}

/* ローディング・エラー・空状態 */
.loading,
.error,
.no-results,
.empty-state,
.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.error {
  color: #ef4444;
}

.hint {
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.5rem;
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .content {
    grid-template-columns: 300px 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }

  .ingredients-panel {
    position: static;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style>

