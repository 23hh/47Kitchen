<template>
  <div class="home">
    <div class="container">
      <div class="hero">
        <h1 class="title">日本全国郷土料理レシピ検索</h1>
        <p class="subtitle">
          お持ちの材料から、全国の郷土料理レシピを探すことができます
        </p>
        <router-link to="/search" class="search-button">
          材料から探す
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ホームページコンポーネント
 * アプリケーションの紹介と検索ページへの導線を提供
 */
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 800px;
  width: 100%;
  padding: 2rem;
}

.hero {
  text-align: center;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.search-button {
  display: inline-block;
  padding: 1rem 3rem;
  background-color: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.search-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .search-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}
</style>

