# ビルドエラー修正ガイド

## 問題

Herokuでビルドが失敗し、アプリが起動しない。

```
npm error command failed
npm error command sh -c npm run build
Process exited with status 127
```

## 修正内容

1. **Procfileの改善**
   - `postinstall`での自動ビルドを削除
   - Procfileで明示的にビルドを実行

2. **package.jsonの修正**
   - `postinstall`スクリプトを削除
   - ビルドをProcfileで制御

## デプロイ手順

### 1. 変更をコミット

```bash
git add Procfile backend/package.json
git commit -m "Fix build process for Heroku"
```

### 2. Herokuにデプロイ

```bash
git push heroku main
```

### 3. ビルドログを確認

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

## ビルドエラーの確認方法

### ローカルでビルドをテスト

```bash
cd backend
npm install
npm run build
```

### ビルドエラーが発生する場合

1. **TypeScriptコンパイルエラー**
   - `tsconfig.json`の設定を確認
   - 型エラーを修正

2. **依存関係の問題**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **NestJS CLIの問題**
   ```bash
   cd backend
   npm install @nestjs/cli --save-dev
   ```

## よくあるビルドエラー

### エラー: "Cannot find module '@nestjs/...'"

**解決方法:**
```bash
cd backend
npm install
```

### エラー: "Type error: ..."

**解決方法:**
- TypeScriptの型エラーを修正
- `tsconfig.json`の`strict`設定を確認

### エラー: "Command not found: nest"

**解決方法:**
```bash
cd backend
npm install @nestjs/cli --save-dev
```

## 次のステップ

1. ローカルでビルドをテスト
2. エラーがあれば修正
3. Herokuにデプロイ
4. ログを確認して問題を解決

