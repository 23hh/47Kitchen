# Heroku Chrome Buildpack設定ガイド

Seleniumを使用するために必要なChrome buildpackの設定方法です。

## 現在のエラー

```
selenium.common.exceptions.SessionNotCreatedException: session not created: Chrome instance exited
```

このエラーは、Chrome buildpackが追加されていないか、環境変数が設定されていない場合に発生します。

## 解決手順

### ステップ1: Chrome Buildpackを追加

```bash
# ChromeDriver buildpackを追加
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chromedriver -a kitchen47-62cc8fa65dcf

# Google Chrome buildpackを追加
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-google-chrome -a kitchen47-62cc8fa65dcf
```

### ステップ2: Buildpackの順序を確認

```bash
heroku buildpacks -a kitchen47-62cc8fa65dcf
```

**期待される順序:**
```
1. heroku/nodejs
2. heroku/python
3. https://github.com/heroku/heroku-buildpack-chromedriver
4. https://github.com/heroku/heroku-buildpack-google-chrome
```

### ステップ3: 環境変数を設定（オプション）

環境変数を設定すると、より確実に動作します:

```bash
heroku config:set GOOGLE_CHROME_BIN=/app/.chromedriver/bin/google-chrome -a kitchen47-62cc8fa65dcf
heroku config:set CHROMEDRIVER_PATH=/app/.chromedriver/bin/chromedriver -a kitchen47-62cc8fa65dcf
```

> 💡 環境変数を設定しなくても、コードが自動的にデフォルトパスを探します。

### ステップ4: 再デプロイ（重要！）

buildpackを追加した後、**必ず再デプロイ**が必要です:

```bash
git commit --allow-empty -m "Trigger rebuild for Chrome buildpacks"
git push heroku main
```

### ステップ5: 確認

再デプロイ後、ログでChrome/ChromeDriverのパスが表示されることを確認:

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

以下のようなログが表示されることを確認:
```
🔧 Chrome binary: /app/.chromedriver/bin/google-chrome
🔧 ChromeDriver path: /app/.chromedriver/bin/chromedriver
```

## トラブルシューティング

### Buildpackが追加されない

1. **Heroku Dashboardで確認:**
   - Settings → Buildpacks
   - Chrome buildpackが追加されているか確認

2. **手動で追加:**
   - Heroku Dashboard → Settings → Buildpacks
   - "Add buildpack"をクリック
   - URLを入力: `https://github.com/heroku/heroku-buildpack-chromedriver`
   - もう一度追加: `https://github.com/heroku/heroku-buildpack-google-chrome`

### 再デプロイ後もエラーが続く

1. **Buildpackのインストールログを確認:**
   ```bash
   heroku logs --tail -a kitchen47-62cc8fa65dcf | grep -i chrome
   ```

2. **Chrome/ChromeDriverがインストールされているか確認:**
   ```bash
   heroku run "ls -la /app/.chromedriver/bin/" -a kitchen47-62cc8fa65dcf
   ```

3. **環境変数を確認:**
   ```bash
   heroku config -a kitchen47-62cc8fa65dcf
   ```

### メモリ不足エラー

Herokuの無料プランではメモリ制限があります。Seleniumはメモリを多く使用するため:

1. **プランをアップグレード** (Basic以上推奨)
2. **スクレイピング処理を軽量化**
3. **BeautifulSoupのみを使用** (Seleniumなし)

## 確認チェックリスト

- [ ] Chrome buildpackが追加されている
- [ ] Buildpackの順序が正しい
- [ ] **再デプロイが完了している**（重要！）
- [ ] ログにChrome/ChromeDriverパスが表示される
- [ ] スクレイピングが実行できる

## 次のステップ

1. Chrome buildpackを追加
2. 再デプロイ
3. ログで確認
4. スクレイピングをテスト実行

