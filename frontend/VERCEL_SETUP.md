# Vercel環境変数設定ガイド

HerokuにデプロイされたバックエンドAPIとフロントエンドを接続するための設定手順です。

## 環境変数の設定

### 1. Vercelダッシュボードで設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. プロジェクト `47-kitchen` を選択
3. **Settings** → **Environment Variables** に移動
4. 以下の環境変数を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://young-hamlet-86995-87b3d8324d80.herokuapp.com` | Production, Preview, Development |

5. **Save** をクリック

### 2. デプロイの再実行

環境変数を追加した後、デプロイを再実行してください:

1. Vercelダッシュボードで **Deployments** タブを開く
2. 最新のデプロイメントの **...** メニューをクリック
3. **Redeploy** を選択

または、Gitにプッシュして自動デプロイをトリガー:

```bash
git push origin main
```

## 確認方法

デプロイ後、以下のURLにアクセスして動作を確認:

- フロントエンド: https://47-kitchen.vercel.app/
- バックエンドAPI: https://young-hamlet-86995-87b3d8324d80.herokuapp.com/recipes

## トラブルシューティング

### CORSエラーが発生する場合

バックエンドのCORS設定を確認してください。`backend/src/main.ts`で以下のURLが許可されていることを確認:

- `https://47-kitchen.vercel.app`
- `http://localhost:5173` (開発環境用)

### API接続エラーが発生する場合

1. バックエンドが正常に起動しているか確認:
   ```bash
   curl https://young-hamlet-86995-87b3d8324d80.herokuapp.com/recipes
   ```

2. Vercelの環境変数が正しく設定されているか確認:
   - Vercelダッシュボードで環境変数を再確認
   - デプロイログで環境変数が読み込まれているか確認

3. ブラウザの開発者ツールでネットワークリクエストを確認:
   - リクエストURLが正しいか
   - CORSエラーが発生していないか

## ローカル開発環境

ローカルで開発する場合は、`frontend/.env`ファイルを作成:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> ⚠️ `.env`ファイルはGitにコミットしないでください。

