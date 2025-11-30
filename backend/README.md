# レシピ検索API バックエンド

日本全国郷土料理レシピを検索するNestJSバックエンドアプリケーション

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
PORT=3000
```

> 💡 `.env.example`ファイルを参考にしてください。実際の`.env`ファイルはGitにコミットしないでください。

### 3. アプリケーションの起動

開発モードで起動：
```bash
npm run start:dev
```

本番モードで起動：
```bash
npm run build
npm run start:prod
```

アプリケーションは `http://localhost:3000` で起動します。

## API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/recipes` | すべてのレシピを取得 |
| GET | `/recipes/:id` | IDでレシピの詳細情報を取得 |
| GET | `/recipes/ingredients` | すべてのレシピから抽出したユニークな材料リストを取得 |
| GET | `/recipes/search` | 材料とカテゴリーでレシピを検索 |
| GET | `/recipes/search/sorted` | 材料とカテゴリーでレシピを検索（マッチした材料数でソート） |

### 検索パラメータ

#### `/recipes/search`

- `ingredients` (必須): カンマ区切りの材料名（例: `そば粉,小麦粉`）
- `category` (オプション): カテゴリー（`rice`, `noodles`, `soup`, `meat_vegetable`, `fish`）
- `limit` (オプション): 取得件数（デフォルト: 10）
- `skip` (オプション): スキップ件数（ページネーション用、デフォルト: 0）

#### 例

```
GET /recipes/search?ingredients=米,鶏肉&category=rice&limit=10&skip=0
```

## プロジェクト構造

```
src/
├── main.ts              # アプリケーションのエントリーポイント
├── app.module.ts        # ルートモジュール
└── recipes/
    ├── recipes.module.ts      # レシピ機能モジュール
    ├── recipes.controller.ts  # レシピAPIコントローラー
    ├── recipes.service.ts     # レシピビジネスロジック
    ├── schemas/
    │   └── recipe.schema.ts   # レシピMongoDBスキーマ
    └── dto/
        ├── search-recipes.dto.ts
        ├── recipe-response.dto.ts
        ├── recipe-detail-response.dto.ts
        └── ingredients-response.dto.ts
```

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `MONGODB_URI` | MongoDB Atlas接続文字列 | ✅ |
| `PORT` | サーバーポート（デフォルト: 3000） | ❌ |

## MongoDB Atlas接続時の注意

- IPv4接続を強制するため、`family: 4`オプションを使用
- IP Whitelistに`0.0.0.0/0`を設定（開発環境の場合）
- 本番環境では特定のIPアドレスのみ許可することを推奨

