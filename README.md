# 🇯🇵 日本全国伝統料理レシピ検索アプリ — 47 Kitchen

> **Vibe Coding プロジェクト**   
> **「Vibe Coding」** で作成しました。

日本全国の郷土料理レシピを  
**材料から検索できる Webアプリケーション** です。

## 🌐 アクセス（アプリリンク）

👉 **[47 Kitchen アプリを開く](https://47-kitchen-adv1omae3-23hs-projects.vercel.app/)**  

---

## 🎯 プロジェクト概要

ユーザーが持っている材料を選択すると、MongoDB Atlasに保存された日本全国の郷土料理レシピの中から、条件に一致するレシピをリストで表示するWebアプリケーションです。

## 🛠️ 技術スタック

### バックエンド
- **NestJS** - Node.jsフレームワーク
- **MongoDB Atlas** - クラウドデータベース
- **Mongoose** - MongoDB ODM
- **TypeScript** - 型安全性

### フロントエンド
- **Vue 3** - プログレッシブJavaScriptフレームワーク
- **Vite** - 高速ビルドツール
- **Vue Router** - ルーティング
- **TypeScript** - 型安全性

### データ収集
- **Python** - スクレイピングスクリプト
- **BeautifulSoup** - HTMLパーサー
- **Selenium** - 動的Webページの操作

### デプロイ
- **Heroku** - バックエンドデプロイ
- **Vercel** - フロントエンドデプロイ

## 📁 プロジェクト構造

```
.
├── backend/              # NestJSバックエンド
│   ├── src/
│   │   ├── main.ts      # エントリーポイント
│   │   ├── app.module.ts # ルートモジュール
│   │   └── recipes/     # レシピ機能モジュール
│   ├── .env.example      # 環境変数サンプル
│   └── package.json
├── frontend/             # Vue3フロントエンド
│   ├── src/
│   │   ├── main.ts      # エントリーポイント
│   │   ├── App.vue      # ルートコンポーネント
│   │   ├── router/      # ルーティング設定
│   │   └── views/       # ページコンポーネント
│   ├── .env.example     # 環境変数サンプル
│   └── package.json
├── scraper/              # データスクレイピングスクリプト
│   ├── scraper.py       # メインスクレイピングスクリプト
│   └── config.py        # 設定ファイル
└── README.md            # このファイル
```

## 🚀 セットアップ

### 前提条件

- **Node.js** 18以上
- **npm** または **yarn**
- **MongoDB Atlas**アカウント（またはローカルMongoDB）
- **Python 3.8以上**（スクレイピング用、オプション）
- **Chrome/Chromium**（スクレイピング用、オプション）

### ポート番号

- **Backend**: `http://localhost:3000` (デフォルト)
- **Frontend**: `http://localhost:5173` (Viteデフォルト)

> ⚠️ **注意**: ポート番号が既に使用されている場合は、環境変数で変更してください。

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
```

#### 環境変数の設定

`backend/.env`ファイルを作成し、以下の環境変数を設定してください：

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
PORT=3000
```

> 💡 `backend/.env.example`ファイルを参考にしてください。  
> ⚠️ **重要**: `.env`ファイルはGitにコミットしないでください。

#### 開発サーバーの起動

```bash
npm run start:dev
```

バックエンドは `http://localhost:3000` で起動します。

### 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

#### 環境変数の設定

`frontend/.env`ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_API_BASE_URL=http://localhost:3000
```

> 💡 `frontend/.env.example`ファイルを参考にしてください。  
> ⚠️ **重要**: `.env`ファイルはGitにコミットしないでください。

#### 開発サーバーの起動

```bash
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

## 📡 API エンドポイント

### レシピ関連

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

## 🗂️ データベース構造

### Recipe スキーマ

```typescript
{
  _id: ObjectId,
  title: string,              // レシピタイトル
  main_image: string,         // メイン画像URL
  main_ingredients: string,   // 主な材料（カンマ区切り）
  eating_method: string,      // 食べ方・作り方の説明
  cooking_method: string,     // 作り方（調理手順）
  ingredients: Array<{       // 詳細な材料リスト
    name: string,
    amount: string
  }> | string,
  category: string,           // カテゴリー
  detailUrl: string,          // 元のレシピページURL
  scrapeCount: number,       // スクレイピング回数
  createdAt: Date,           // 作成日時
  updatedAt: Date            // 更新日時
}
```

## 🕷️ データスクレイピング（オプション）

新しいレシピデータを収集する場合：

```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```

> ⚠️ スクレイピングは対象サイトの利用規約を確認してから実行してください。

## 🚢 デプロイ

### バックエンド（Heroku）

1. Herokuアカウントを作成
2. Heroku CLIでログイン
3. アプリを作成
4. 環境変数を設定：
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   ```
5. デプロイ：
   ```bash
   git push heroku main
   ```

### フロントエンド（Vercel）

1. Vercelアカウントを作成
2. プロジェクトをインポート
3. 環境変数を設定：
   - `VITE_API_BASE_URL`: デプロイされたバックエンドURL
4. デプロイ（自動）

## 📝 開発メモ

### MongoDB Atlas接続時の注意

- IPv4接続を強制するため、`family: 4`オプションを使用
- IP Whitelistに`0.0.0.0/0`を設定（開発環境の場合）

### 環境変数の管理

- `.env`ファイルはGitにコミットしない
- `.env.example`を参考に環境変数を設定
- 本番環境では各プラットフォームの環境変数設定を使用

## 📄 ライセンス

MIT

## 👥 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

