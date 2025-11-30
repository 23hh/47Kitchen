# 日本全国郷土料理レシピ検索アプリ（フロントエンド）

Vue3 + Viteで構築されたフロントエンドアプリケーション

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_API_BASE_URL=http://localhost:3000
```

> 💡 `.env.example`ファイルを参考にしてください。実際の`.env`ファイルはGitにコミットしないでください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で起動します。

## プロジェクト構造

```
src/
├── main.ts              # アプリケーションのエントリーポイント
├── App.vue              # ルートコンポーネント
├── router/
│   └── index.ts         # Vue Router設定
└── views/
    ├── Home.vue         # ホームページ
    ├── SearchView.vue   # 材料選択・レシピ検索ページ
    └── RecipeDetailView.vue  # レシピ詳細ページ
```

## ルーティング

| パス | コンポーネント | 説明 |
|------|---------------|------|
| `/` | `Home.vue` | ホームページ |
| `/search` | `SearchView.vue` | 材料選択・レシピ検索ページ |
| `/recipes/:id` | `RecipeDetailView.vue` | レシピ詳細ページ |

## ビルド

本番用ビルド：

```bash
npm run build
```

ビルド結果は `dist` フォルダに出力されます。

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `VITE_API_BASE_URL` | バックエンドAPIのベースURL | ✅ |

## 開発時の注意

- Viteの開発サーバーは`http://localhost:5173`で起動します
- プロキシ設定により、`/api`で始まるリクエストは自動的にバックエンドに転送されます
- 本番環境では`VITE_API_BASE_URL`を本番バックエンドURLに設定してください

