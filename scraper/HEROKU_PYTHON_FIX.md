# Heroku Python Buildpack設定と再デプロイ

`pip: command not found`エラーを解決するには、Python buildpackを追加した後、**必ず再デプロイ**が必要です。

## 問題

Python buildpackを追加しても、再デプロイしないとPythonがインストールされません。

## 解決手順

### ステップ1: Python Buildpackを追加（まだの場合）

#### 方法A: Heroku CLI使用

```bash
# 現在のbuildpackを確認
heroku buildpacks -a kitchen47-62cc8fa65dcf

# Python buildpackを追加
heroku buildpacks:add heroku/python -a kitchen47-62cc8fa65dcf

# buildpack順序を確認（Node.jsが1番目、Pythonが2番目）
heroku buildpacks -a kitchen47-62cc8fa65dcf
```

#### 方法B: Heroku Dashboard使用

1. [Heroku Dashboard](https://dashboard.heroku.com/apps/kitchen47-62cc8fa65dcf)にアクセス
2. **Settings**タブを開く
3. **Buildpacks**セクションまでスクロール
4. **Add buildpack**をクリック
5. `heroku/python`を入力して**Save changes**をクリック

### ステップ2: 再デプロイ（重要！）

buildpackを追加した後、**必ず再デプロイ**が必要です。

#### 方法A: Gitで再デプロイ

```bash
# 空のコミットで再デプロイをトリガー
git commit --allow-empty -m "Trigger rebuild for Python buildpack"
git push heroku main
```

#### 方法B: Heroku Dashboardで再デプロイ

1. Heroku Dashboardで**Deploy**タブを開く
2. **Manual deploy**セクションで
3. **Deploy Branch**をクリック（mainブランチを選択）

#### 方法C: Heroku CLIで再デプロイ

```bash
# 最新のコミットを再デプロイ
git push heroku main
```

### ステップ3: 再デプロイの確認

再デプロイ中にログを確認:

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

以下のようなログが表示されることを確認:

```
-----> Python app detected
-----> Installing python-3.x.x
-----> Installing pip
```

### ステップ4: Pythonがインストールされたか確認

```bash
# Pythonバージョン確認
heroku run "python --version" -a kitchen47-62cc8fa65dcf

# pipバージョン確認
heroku run "pip --version" -a kitchen47-62cc8fa65dcf
```

### ステップ5: スクレイピングをテスト実行

```bash
heroku run "cd scraper && pip install -r requirements.txt && python scraper.py" -a kitchen47-62cc8fa65dcf
```

## トラブルシューティング

### 再デプロイ後もpipが見つからない

1. **buildpackが正しく追加されているか確認:**
   ```bash
   heroku buildpacks -a kitchen47-62cc8fa65dcf
   ```
   出力に`heroku/python`が含まれていることを確認

2. **再デプロイログを確認:**
   ```bash
   heroku logs --tail -a kitchen47-62cc8fa65dcf | grep -i python
   ```

3. **buildpackの順序を確認:**
   - Node.jsが1番目
   - Pythonが2番目
   
   順序が間違っている場合:
   ```bash
   heroku buildpacks:clear -a kitchen47-62cc8fa65dcf
   heroku buildpacks:add heroku/nodejs -a kitchen47-62cc8fa65dcf
   heroku buildpacks:add heroku/python -a kitchen47-62cc8fa65dcf
   git commit --allow-empty -m "Fix buildpack order"
   git push heroku main
   ```

### Seleniumを使用する場合

Seleniumを使用する場合は、Chrome buildpackも追加:

```bash
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chromedriver -a kitchen47-62cc8fa65dcf
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-google-chrome -a kitchen47-62cc8fa65dcf
```

その後、再デプロイ:
```bash
git commit --allow-empty -m "Add Chrome buildpacks"
git push heroku main
```

## 確認チェックリスト

- [ ] Python buildpackが追加されている
- [ ] buildpackの順序が正しい（Node.js → Python）
- [ ] **再デプロイが完了している**（重要！）
- [ ] `python --version`が動作する
- [ ] `pip --version`が動作する
- [ ] スクレイピングが実行できる

## 重要なポイント

⚠️ **buildpackを追加しただけでは不十分です。必ず再デプロイが必要です！**

buildpackは**ビルド時**にインストールされるため、既存のアプリにbuildpack을追加した場合は、再デプロイ（再ビルド）が必要です。

