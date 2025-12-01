# トラブルシューティングガイド

## 503 Service Unavailable エラー

Herokuアプリが503エラーを返す場合、以下の原因が考えられます。

### 1. アプリが起動していない

**確認方法:**
```bash
heroku ps
```

**解決方法:**
```bash
# アプリを再起動
heroku restart

# または、スケールを確認
heroku ps:scale web=1
```

### 2. MongoDB接続エラー

**確認方法:**
```bash
heroku logs --tail
```

MongoDB接続エラーが表示される場合:

1. **環境変数を確認:**
   ```bash
   heroku config:get MONGODB_URI
   ```

2. **MongoDB Atlas設定を確認:**
   - Network Accessで`0.0.0.0/0`が許可されているか
   - Database Accessでユーザーが正しく設定されているか
   - Connection Stringが正しいか

3. **環境変数を再設定:**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
   ```

### 3. ビルドエラー

**確認方法:**
```bash
heroku logs --tail
```

TypeScriptコンパイルエラーが表示される場合:

1. **ローカルでビルドをテスト:**
   ```bash
   cd backend
   npm run build
   ```

2. **エラーを修正して再デプロイ:**
   ```bash
   git add .
   git commit -m "Fix build errors"
   git push heroku main
   ```

### 4. 依存関係のインストールエラー

**確認方法:**
```bash
heroku logs --tail
```

`npm install`エラーが表示される場合:

1. **package.jsonを確認**
2. **node_modulesを削除して再インストール:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update dependencies"
   git push heroku main
   ```

## CORSエラー

### エラーメッセージ
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

### 解決方法

1. **Heroku環境変数を確認:**
   ```bash
   heroku config:get ALLOWED_ORIGINS
   ```

2. **環境変数を設定:**
   ```bash
   heroku config:set ALLOWED_ORIGINS="https://47-kitchen.vercel.app,http://localhost:5173"
   ```

3. **アプリを再起動:**
   ```bash
   heroku restart
   ```

4. **コードを確認:**
   - `backend/src/main.ts`でCORS設定を確認
   - フロントエンドURLが許可されているか確認

## アプリが起動しない

### 確認事項

1. **Procfileが正しいか:**
   ```bash
   cat Procfile
   ```
   内容: `web: cd backend && npm install && npm run start:prod`

2. **dist/main.jsが存在するか:**
   ```bash
   heroku run ls -la backend/dist/
   ```

3. **ログを確認:**
   ```bash
   heroku logs --tail
   ```

### 解決方法

1. **ローカルでビルドを確認:**
   ```bash
   cd backend
   npm run build
   ls dist/main.js
   ```

2. **package.jsonのpostinstallスクリプトを確認:**
   ```json
   {
     "scripts": {
       "postinstall": "npm run build"
     }
   }
   ```

3. **再デプロイ:**
   ```bash
   git add .
   git commit -m "Fix deployment"
   git push heroku main
   ```

## 環境変数の確認と設定

### すべての環境変数を確認
```bash
heroku config
```

### 環境変数を設定
```bash
heroku config:set KEY=value
```

### 必要な環境変数
- `MONGODB_URI`: MongoDB Atlas接続文字列（必須）
- `ALLOWED_ORIGINS`: CORS許可オリジン（オプション）
- `NODE_ENV`: 環境（オプション、デフォルト: production）

## ログの確認

### リアルタイムログ
```bash
heroku logs --tail
```

### 最近のログ
```bash
heroku logs --num 100
```

### 特定のプロセスのログ
```bash
heroku logs --ps web
```

## アプリの状態確認

### プロセス状態
```bash
heroku ps
```

### アプリ情報
```bash
heroku info
```

### アプリを開く
```bash
heroku open
```

## よくある問題と解決策

### 問題: "Application error" が表示される

**原因:** アプリがクラッシュしている

**解決方法:**
1. ログを確認: `heroku logs --tail`
2. エラーメッセージを確認
3. エラーを修正して再デプロイ

### 問題: タイムアウトエラー

**原因:** アプリの起動に時間がかかりすぎている

**解決方法:**
1. `Procfile`で起動コマンドを最適化
2. 不要な依存関係を削除
3. ビルド時間を短縮

### 問題: MongoDB接続がタイムアウト

**原因:** MongoDB AtlasのNetwork Access設定

**解決方法:**
1. MongoDB AtlasダッシュボードでNetwork Accessを確認
2. `0.0.0.0/0`を追加（開発環境）
3. またはHerokuのIP範囲を追加（本番環境）

## デバッグのヒント

1. **ローカルでテスト:**
   ```bash
   cd backend
   npm run start:prod
   ```

2. **環境変数をローカルで設定:**
   ```bash
   export MONGODB_URI="your-mongodb-uri"
   npm run start:prod
   ```

3. **Herokuでシェルにアクセス:**
   ```bash
   heroku run bash
   ```

4. **アプリの状態を確認:**
   ```bash
   heroku ps:exec
   ```

