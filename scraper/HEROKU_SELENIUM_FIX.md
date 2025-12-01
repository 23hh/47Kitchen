# Heroku Selenium Chrome設定ガイド

HerokuでSeleniumを使用する場合のChrome設定方法です。

## 問題

`selenium.common.exceptions.SessionNotCreatedException: session not created: Chrome instance exited`

このエラーは、Heroku環境でChrome/ChromeDriverが正しく設定されていない場合に発生します。

## 解決方法

### ステップ1: Chrome Buildpackを追加

```bash
# ChromeDriver buildpack
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chromedriver -a kitchen47-62cc8fa65dcf

# Google Chrome buildpack
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-google-chrome -a kitchen47-62cc8fa65dcf
```

### ステップ2: 環境変数を設定

```bash
# Chromeバイナリのパス
heroku config:set GOOGLE_CHROME_BIN=/app/.chromedriver/bin/google-chrome -a kitchen47-62cc8fa65dcf

# ChromeDriverのパス
heroku config:set CHROMEDRIVER_PATH=/app/.chromedriver/bin/chromedriver -a kitchen47-62cc8fa65dcf
```

### ステップ3: 再デプロイ

buildpackを追加した後、必ず再デプロイが必要です:

```bash
git commit --allow-empty -m "Trigger rebuild for Chrome buildpacks"
git push heroku main
```

### ステップ4: 確認

```bash
# 環境変数が設定されているか確認
heroku config -a kitchen47-62cc8fa65dcf

# buildpackが追加されているか確認
heroku buildpacks -a kitchen47-62cc8fa65dcf
```

## コードの変更

`scraper.py`の`collect_top5_from_category`関数が以下のように更新されました:

- Heroku環境用のChromeオプション追加
- 環境変数からChrome/ChromeDriverパスを読み込み
- Serviceオブジェクトを使用してChromeDriverを初期化

## トラブルシューティング

### メモリ不足エラー

Herokuの無料プランではメモリ制限があります。Seleniumはメモリを多く使用するため、以下の対策を検討:

1. **プランをアップグレード** (Basic以上)
2. **スクレイピング処理を軽量化**
3. **BeautifulSoupのみを使用** (Seleniumなし)

### Chromeが見つからない

1. **buildpackが追加されているか確認:**
   ```bash
   heroku buildpacks -a kitchen47-62cc8fa65dcf
   ```

2. **環境変数が設定されているか確認:**
   ```bash
   heroku config:get GOOGLE_CHROME_BIN -a kitchen47-62cc8fa65dcf
   heroku config:get CHROMEDRIVER_PATH -a kitchen47-62cc8fa65dcf
   ```

3. **再デプロイ:**
   ```bash
   git push heroku main
   ```

### タイムアウトエラー

Seleniumのタイムアウトを調整:

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 30)  # 30秒待機
```

## 代替案: BeautifulSoupのみを使用

Seleniumが動作しない場合、BeautifulSoupのみでスクレイピングする方法も検討できます。ただし、動的コンテンツ（JavaScriptで生成されるコンテンツ）は取得できません。

## 確認チェックリスト

- [ ] Chrome buildpackが追加されている
- [ ] 環境変数が設定されている
- [ ] 再デプロイが完了している
- [ ] スクレイピングが実行できる

