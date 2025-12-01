# バックエンドAPIテストガイド

HerokuにデプロイされたバックエンドAPIをテストする方法です。

## ベースURL

```
https://kitchen47-62cc8fa65dcf.herokuapp.com
```

## テスト方法

### 1. ブラウザで直接アクセス

最も簡単な方法です。以下のURLをブラウザのアドレスバーに入力してください。

#### すべてのレシピを取得
```
https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes
```

#### 材料リストを取得
```
https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/ingredients
```

#### レシピを検索
```
https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/search?ingredients=米,鶏肉
```

### 2. curlコマンドでテスト

ターミナル（コマンドプロンプト）から以下のコマンドを実行します。

#### サーバーが起動しているか確認
```bash
curl https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes
```

#### 材料リストを取得
```bash
curl https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/ingredients
```

#### レシピを検索
```bash
curl "https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/search?ingredients=米,鶏肉"
```

#### 特定のレシピの詳細を取得
```bash
curl https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/[レシピID]
```

> 💡 WindowsのPowerShellでは、URLを引用符で囲む必要がある場合があります。

### 3. Postmanでテスト

1. [Postman](https://www.postman.com/)をインストール
2. 新しいリクエストを作成
3. メソッドを`GET`に設定
4. URLを入力して送信

### 4. ブラウザの開発者ツールでテスト

1. ブラウザで開発者ツールを開く（F12キー）
2. **Console**タブを開く
3. 以下のJavaScriptコードを実行:

```javascript
// 材料リストを取得
fetch('https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/ingredients')
  .then(response => response.json())
  .then(data => console.log(data));

// レシピを検索
fetch('https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/search?ingredients=米,鶏肉')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 利用可能なエンドポイント

### 1. すべてのレシピを取得
```
GET /recipes
```

**レスポンス例:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "鶏めし（とりめし）",
    "main_image": "https://...",
    "main_ingredients": "鶏肉、ごぼう、米",
    "category": "rice"
  }
]
```

### 2. 材料リストを取得
```
GET /recipes/ingredients
```

**レスポンス例:**
```json
{
  "ingredients": ["米", "鶏肉", "ごぼう", "そば粉", ...]
}
```

### 3. レシピを検索
```
GET /recipes/search?ingredients=米,鶏肉&category=rice&limit=10&skip=0
```

**パラメータ:**
- `ingredients` (必須): カンマ区切りの材料名
- `category` (オプション): カテゴリー（`rice`, `noodles`, `soup`, `meat_vegetable`, `fish`）
- `limit` (オプション): 取得件数（デフォルト: 10）
- `skip` (オプション): スキップ件数（デフォルト: 0）

**レスポンス例:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "鶏めし（とりめし）",
    "main_image": "https://...",
    "main_ingredients": "鶏肉、ごぼう、米",
    "category": "rice"
  }
]
```

### 4. レシピを検索（マッチした材料数でソート）
```
GET /recipes/search/sorted?ingredients=米,鶏肉&category=rice&limit=10
```

マッチした材料数が多い順にソートされます。

### 5. 特定のレシピの詳細を取得
```
GET /recipes/:id
```

**レスポンス例:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "鶏めし（とりめし）",
  "main_image": "https://...",
  "main_ingredients": "鶏肉、ごぼう、米",
  "eating_method": "作り方の説明...",
  "cooking_method": "1. 米を洗い...\n2. 炊き上がったら...",
  "ingredients": [
    {"name": "米", "amount": "3カップ"},
    {"name": "地鶏", "amount": "150g"}
  ],
  "category": "rice",
  "detailUrl": "https://..."
}
```

## 正常なレスポンスの確認

### ✅ 成功時のレスポンス

- **ステータスコード**: `200 OK`
- **Content-Type**: `application/json`
- **レスポンスボディ**: JSON形式のデータ

### ❌ エラー時のレスポンス

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "レシピが見つかりませんでした",
  "error": "Not Found"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## トラブルシューティング

### 接続できない場合

1. **Herokuアプリが起動しているか確認**
   ```bash
   heroku ps
   ```

2. **Herokuログを確認**
   ```bash
   heroku logs --tail
   ```

3. **環境変数が正しく設定されているか確認**
   ```bash
   heroku config
   ```

### CORSエラーが発生する場合

バックエンドのCORS設定を確認してください。`backend/src/main.ts`で以下のURLが許可されていることを確認:

- `https://47-kitchen.vercel.app`
- `http://localhost:5173` (開発環境用)

### MongoDB接続エラーが発生する場合

1. `MONGODB_URI`環境変数が正しく設定されているか確認
2. MongoDB AtlasのNetwork Access設定を確認
3. MongoDB AtlasのIP Whitelistを確認

## ローカル環境でのテスト

ローカル環境でテストする場合:

```bash
cd backend
npm run start:dev
```

その後、以下のURLでアクセス:
```
http://localhost:3000/recipes
```

