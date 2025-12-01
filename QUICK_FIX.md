# 緊急修正ガイド

## CORSエラーと503エラーの解決方法

### 1. Herokuに変更をデプロイ

変更したCORS設定をHerokuにデプロイする必要があります。

```bash
# Herokuにプッシュ
git push heroku main
```

または、Herokuアプリ名を指定:

```bash
git push heroku main -a kitchen47-62cc8fa65dcf
```

### 2. Herokuアプリの状態確認

```bash
# アプリの状態を確認
heroku ps -a kitchen47-62cc8fa65dcf

# ログを確認
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

### 3. 環境変数の確認と設定

```bash
# 現在の環境変数を確認
heroku config -a kitchen47-62cc8fa65dcf

# MongoDB URIが設定されているか確認
heroku config:get MONGODB_URI -a kitchen47-62cc8fa65dcf

# MongoDB URIが設定されていない場合、設定
heroku config:set MONGODB_URI="your-mongodb-uri" -a kitchen47-62cc8fa65dcf

# CORS許可オリジンを設定（オプション）
heroku config:set ALLOWED_ORIGINS="https://47-kitchen.vercel.app,http://localhost:5173" -a kitchen47-62cc8fa65dcf
```

### 4. アプリの再起動

```bash
heroku restart -a kitchen47-62cc8fa65dcf
```

### 5. 動作確認

ブラウザで以下にアクセスして確認:

```
https://kitchen47-62cc8fa65dcf.herokuapp.com/recipes/ingredients
```

正常に動作する場合、JSONレスポンスが返ってきます。

## よくある問題

### 問題: "No app specified" エラー

**解決方法:**
```bash
# Herokuリモートを確認
git remote -v

# Herokuリモートが設定されていない場合
heroku git:remote -a kitchen47-62cc8fa65dcf
```

### 問題: デプロイ後も503エラーが続く

**確認事項:**
1. MongoDB URIが正しく設定されているか
2. MongoDB AtlasのNetwork Access設定
3. ビルドが成功しているか（ログで確認）

**解決方法:**
```bash
# ログを詳しく確認
heroku logs --tail -a kitchen47-62cc8fa65dcf

# エラーメッセージを確認して対応
```

### 問題: CORSエラーが続く

**確認事項:**
1. デプロイが完了しているか
2. アプリが再起動されたか
3. ブラウザのキャッシュをクリア

**解決方法:**
```bash
# アプリを再起動
heroku restart -a kitchen47-62cc8fa65dcf

# ブラウザでハードリフレッシュ（Ctrl+Shift+R または Cmd+Shift+R）
```

## 次のステップ

1. Herokuにデプロイ: `git push heroku main`
2. ログを確認: `heroku logs --tail`
3. 動作確認: ブラウザでAPIエンドポイントにアクセス
4. 問題が解決しない場合、ログのエラーメッセージを確認

