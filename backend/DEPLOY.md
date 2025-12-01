# Heroku デプロイガイド

このドキュメントは、NestJSバックエンドをHerokuにデプロイする方法を説明します。

## 事前準備

1. Herokuアカウント作成: https://www.heroku.com/
2. Heroku CLIインストール: https://devcenter.heroku.com/articles/heroku-cli
3. MongoDB Atlasアカウントとクラスター設定（またはHeroku MongoDB Add-on使用）

## デプロイ手順

### 1. Heroku CLIログイン

```bash
heroku login
```

### 2. Herokuアプリ作成

```bash
cd backend
heroku create your-app-name
```

> 💡 `your-app-name`を希望するアプリ名に変更してください。名前が既に使用されている場合は別の名前を使用する必要があります。

### 3. Node.jsビルドパック設定

```bash
heroku buildpacks:set heroku/nodejs
```

### 4. 環境変数設定

MongoDB Atlasを使用する場合:

```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
```

フロントエンドURLを環境変数として設定（オプション）:

```bash
heroku config:set ALLOWED_ORIGINS="https://47-kitchen.vercel.app,http://localhost:5173"
```

> 💡 `ALLOWED_ORIGINS`を設定しない場合、デフォルト値が使用されます。

### 5. Gitリポジトリ初期化とコミット（まだ行っていない場合）

```bash
git init
git add .
git commit -m "Initial commit"
```

### 6. Herokuリモートリポジトリ追加

```bash
heroku git:remote -a your-app-name
```

### 7. デプロイ

```bash
git push heroku main
```

または`master`ブランチを使用する場合:

```bash
git push heroku master
```

### 8. アプリ確認

```bash
heroku open
```

またはブラウザで`https://your-app-name.herokuapp.com`にアクセス

## ログ確認

```bash
# リアルタイムログ確認
heroku logs --tail

# 最近のログ確認
heroku logs --num 100
```

## 環境変数確認

```bash
heroku config
```

## 環境変数変更

```bash
heroku config:set KEY=value
```

## 環境変数削除

```bash
heroku config:unset KEY
```

## MongoDB Atlas設定

MongoDB Atlasを使用する場合:

1. MongoDB AtlasダッシュボードでNetwork Access設定
2. IP Whitelistに`0.0.0.0/0`を追加（すべてのIPを許可）またはHerokuのIP範囲を追加
3. Database Accessでユーザー作成と権限設定
4. Connection Stringをコピーして`MONGODB_URI`環境変数に設定

## Heroku MongoDB Add-on使用（オプション）

MongoDB Atlasの代わりにHeroku Add-onを使用することもできます:

```bash
heroku addons:create mongolab:sandbox
```

この場合、`MONGODB_URI`は自動的に設定されます。

## フロントエンド設定更新

Herokuデプロイ後、バックエンドURLをフロントエンドに設定する必要があります。

Vercel環境変数設定:
1. Vercelダッシュボードでプロジェクトを選択
2. Settings > Environment Variablesに移動
3. `VITE_API_BASE_URL`変数を追加
4. 値: `https://your-app-name.herokuapp.com`
5. デプロイを再実行

または`.env.production`ファイルに追加:

```env
VITE_API_BASE_URL=https://your-app-name.herokuapp.com
```

## トラブルシューティング

### ビルド失敗

- `heroku logs --tail`でログを確認
- `package.json`の`postinstall`スクリプトを確認
- TypeScriptコンパイルエラーを確認

### MongoDB接続失敗

- `MONGODB_URI`環境変数を確認: `heroku config:get MONGODB_URI`
- MongoDB Atlas Network Access設定を確認
- MongoDB Atlas IP Whitelistを確認

### CORSエラー

- `ALLOWED_ORIGINS`環境変数を確認
- フロントエンドURLが許可されたリストに含まれているか確認

### アプリが起動しない

- `Procfile`が正しいか確認
- `dist/main.js`ファイルが存在するか確認
- `heroku logs --tail`でエラーメッセージを確認

## 追加リソース

- [Heroku Node.jsサポートドキュメント](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku環境変数設定](https://devcenter.heroku.com/articles/config-vars)
- [MongoDB Atlasドキュメント](https://docs.atlas.mongodb.com/)
