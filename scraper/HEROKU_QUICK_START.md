# Herokuでスクレイピングを実行する方法（クイックスタート）

既にデプロイされたHerokuアプリでスクレイピングを実行する方法です。

## 方法1: 手動実行（テスト用）

### 1. 一度だけ実行

```bash
heroku run "cd scraper && pip install -r requirements.txt && python scraper.py" -a kitchen47-62cc8fa65dcf
```

### 2. ログを確認

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

## 方法2: Heroku Schedulerで自動実行（推奨）

### ステップ1: Heroku Scheduler Add-onを追加

```bash
heroku addons:create scheduler:standard -a kitchen47-62cc8fa65dcf
```

> 💡 無料プランでも使用可能（1日1回のジョブ実行が可能）

### ステップ2: Python Buildpackを追加

```bash
# 現在のbuildpackを確認
heroku buildpacks -a kitchen47-62cc8fa65dcf

# Python buildpackを追加
heroku buildpacks:add heroku/python -a kitchen47-62cc8fa65dcf

# buildpackの順序を確認（Node.jsが最初、Pythonが2番目であることを確認）
heroku buildpacks -a kitchen47-62cc8fa65dcf
```

**期待される出力:**
```
1. heroku/nodejs
2. heroku/python
```

### ステップ3: Selenium用のChrome Buildpackを追加（Seleniumを使用する場合）

```bash
# ChromeDriver buildpack
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chromedriver -a kitchen47-62cc8fa65dcf

# Google Chrome buildpack
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-google-chrome -a kitchen47-62cc8fa65dcf
```

### ステップ4: 環境変数を確認

```bash
# MongoDB URIが設定されているか確認
heroku config:get MONGODB_URI -a kitchen47-62cc8fa65dcf

# 設定されていない場合、設定
heroku config:set MONGODB_URI="your-mongodb-uri" -a kitchen47-62cc8fa65dcf
```

### ステップ5: Heroku Dashboardでスケジュールを設定

1. [Heroku Dashboard](https://dashboard.heroku.com/apps/kitchen47-62cc8fa65dcf)にアクセス
2. **Resources**タブを開く
3. **Heroku Scheduler**セクションを探す
4. **Create job**ボタンをクリック
5. 以下の設定を入力:
   - **Schedule**: `0 2 * * *` (毎日午前2時 UTC、日本時間では午前11時)
   - **Run Command**: `cd scraper && pip install -r requirements.txt && python scraper.py`
6. **Save Job**をクリック

### ステップ6: テスト実行

```bash
# 手動で実行してテスト
heroku run "cd scraper && pip install -r requirements.txt && python scraper.py" -a kitchen47-62cc8fa65dcf
```

## スケジュール設定例

| 説明 | Cron式 | 実行時間（UTC） | 実行時間（JST） |
|------|--------|----------------|----------------|
| 毎日午前2時 | `0 2 * * *` | 02:00 | 11:00 |
| 毎日午前0時 | `0 0 * * *` | 00:00 | 09:00 |
| 毎日午後2時 | `0 14 * * *` | 14:00 | 23:00 |
| 毎週日曜日午前2時 | `0 2 * * 0` | 02:00 | 11:00 |

## トラブルシューティング

### Pythonが見つからない

**エラー:** `python: command not found`

**解決方法:**
```bash
# Python buildpackが追加されているか確認
heroku buildpacks -a kitchen47-62cc8fa65dcf

# 追加されていない場合
heroku buildpacks:add heroku/python -a kitchen47-62cc8fa65dcf

# 再デプロイが必要な場合
git commit --allow-empty -m "Trigger rebuild for Python buildpack"
git push heroku main
```

### パッケージのインストールエラー

**エラー:** `pip install`が失敗する

**解決方法:**
1. `scraper/requirements.txt`の内容を確認
2. 手動でインストールをテスト:
   ```bash
   heroku run "cd scraper && pip install -r requirements.txt" -a kitchen47-62cc8fa65dcf
   ```

### Seleniumが動作しない

**エラー:** Chrome/Chromiumが見つからない

**解決方法:**
1. Chrome buildpackが追加されているか確認:
   ```bash
   heroku buildpacks -a kitchen47-62cc8fa65dcf
   ```

2. 環境変数が設定されているか確認:
   ```bash
   heroku config -a kitchen47-62cc8fa65dcf
   ```

3. 再デプロイ:
   ```bash
   git commit --allow-empty -m "Trigger rebuild for Chrome buildpack"
   git push heroku main
   ```

### MongoDB接続エラー

**エラー:** MongoDBに接続できない

**解決方法:**
1. `MONGODB_URI`環境変数が設定されているか確認:
   ```bash
   heroku config:get MONGODB_URI -a kitchen47-62cc8fa65dcf
   ```

2. MongoDB AtlasのNetwork Access設定を確認
3. IP Whitelistに`0.0.0.0/0`が追加されているか確認

### ログの確認

```bash
# リアルタイムログ
heroku logs --tail -a kitchen47-62cc8fa65dcf

# Schedulerのログを確認
heroku logs --ps scheduler -a kitchen47-62cc8fa65dcf

# 最近のログ（100行）
heroku logs --num 100 -a kitchen47-62cc8fa65dcf
```

## 実行確認

### 1. 手動実行でテスト

```bash
heroku run "cd scraper && pip install -r requirements.txt && python scraper.py" -a kitchen47-62cc8fa65dcf
```

### 2. ログで確認

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

### 3. MongoDBで確認

MongoDB Atlasのダッシュボードで、新しいレシピが追加されているか確認してください。

## 次のステップ

1. ✅ Heroku Scheduler add-onを追加
2. ✅ Python buildpackを追加
3. ✅ Heroku Dashboardでスケジュールを設定
4. ✅ 手動でテスト実行
5. ✅ スケジュール実行を確認

