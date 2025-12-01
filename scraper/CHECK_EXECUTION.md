# Heroku Scheduler実行確認方法

Heroku Schedulerで設定したスクレイピングジョブが正常に実行されているか確認する方法です。

## 方法1: Heroku Dashboardで確認

### 1. Schedulerページで確認

1. [Heroku Dashboard](https://dashboard.heroku.com/apps/kitchen47-62cc8fa65dcf)にアクセス
2. **Resources**タブを開く
3. **Heroku Scheduler**セクションをクリック
4. 設定したジョブが表示されます
5. ジョブの右側に**"Run now"**ボタンがある場合は、手動で実行できます

### 2. 実行履歴の確認

- ジョブの下に**"Last run"**（最終実行時刻）が表示されます
- **"Next run"**（次回実行時刻）も表示されます

## 方法2: ログで確認

### リアルタイムログ

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf
```

### Scheduler専用ログ

```bash
heroku logs --ps scheduler -a kitchen47-62cc8fa65dcf
```

### 最近のログ（100行）

```bash
heroku logs --num 100 -a kitchen47-62cc8fa65dcf
```

### ログで確認すべき内容

正常に実行されている場合、以下のようなログが表示されます:

```
🚀 スクレイピング開始
📂 カテゴリー: rice
🔹 カテゴリーリスト収集: https://www.maff.go.jp/...
  ↺ 1回リフレッシュ: +3個（累計 3個）
  ✅ 5個以上収集完了
  ➤ 最終選択されたURL 5個
[GET 詳細] https://www.maff.go.jp/...
💾 MongoDB保存/更新完了: 5件
✅ スクレイピング + DB保存 + CSVバックアップ完了!
```

## 方法3: 手動でテスト実行

### 即座に実行して確認

```bash
heroku run "cd scraper && pip install -r requirements.txt && python scraper.py" -a kitchen47-62cc8fa65dcf
```

このコマンドで実行すると、リアルタイムで出力が表示されます。

### 実行結果の確認ポイント

1. **スクレイピング開始メッセージ**: `🚀 スクレイピング開始`
2. **カテゴリー別の進行状況**: `📂 カテゴリー: rice`
3. **URL収集状況**: `↺ 1回リフレッシュ: +3個`
4. **MongoDB保存確認**: `💾 MongoDB保存/更新完了: X件`
5. **完了メッセージ**: `✅ スクレイピング + DB保存 + CSVバックアップ完了!`

## 方法4: MongoDBでデータ確認

### MongoDB Atlasダッシュボードで確認

1. [MongoDB Atlas](https://cloud.mongodb.com/)にログイン
2. クラスターを選択
3. **Browse Collections**をクリック
4. `recipe`データベースの`recipes`コレクションを確認
5. 新しいレシピが追加されているか確認
6. `createdAt`フィールドで最新のデータを確認

### データ件数の確認

```bash
# MongoDBに接続して件数を確認（ローカル環境の場合）
mongo "your-mongodb-uri" --eval "db.recipes.countDocuments()"
```

## 方法5: エラーの確認

### エラーログの確認

```bash
heroku logs --tail -a kitchen47-62cc8fa65dcf | grep -i error
```

### よくあるエラー

#### 1. Pythonが見つからない
```
python: command not found
```
**解決方法:** Python buildpackが追加されているか確認

#### 2. パッケージのインストールエラー
```
pip install failed
```
**解決方法:** `requirements.txt`の内容を確認

#### 3. MongoDB接続エラー
```
MongoDB connection failed
```
**解決方法:** `MONGODB_URI`環境変数を確認

#### 4. Seleniumエラー
```
Chrome/Chromium not found
```
**解決方法:** Chrome buildpackが追加されているか確認

## 方法6: 実行時間の確認

### ジョブの実行時間を確認

Heroku Dashboardの**Metrics**タブで:
1. **Dyno hours**を確認
2. Schedulerジョブの実行時間を確認
3. メモリ使用量を確認

## トラブルシューティング

### ジョブが実行されない場合

1. **Scheduler add-onが有効か確認**
   ```bash
   heroku addons -a kitchen47-62cc8fa65dcf
   ```

2. **スケジュール設定を確認**
   - Heroku Dashboardでジョブの設定を確認
   - Cron式が正しいか確認

3. **ログでエラーを確認**
   ```bash
   heroku logs --ps scheduler -a kitchen47-62cc8fa65dcf
   ```

### ジョブが失敗する場合

1. **手動で実行してエラーを確認**
   ```bash
   heroku run "cd scraper && python scraper.py" -a kitchen47-62cc8fa65dcf
   ```

2. **環境変数を確認**
   ```bash
   heroku config -a kitchen47-62cc8fa65dcf
   ```

3. **buildpackを確認**
   ```bash
   heroku buildpacks -a kitchen47-62cc8fa65dcf
   ```

## 確認チェックリスト

- [ ] Heroku Dashboardでジョブが作成されている
- [ ] "Last run"に実行時刻が表示されている
- [ ] ログにスクレイピング開始メッセージが表示される
- [ ] MongoDBに新しいデータが追加されている
- [ ] エラーメッセージがない
- [ ] 実行時間が適切（数分以内）

## 次のステップ

1. ✅ 手動でテスト実行
2. ✅ ログで実行状況を確認
3. ✅ MongoDBでデータを確認
4. ✅ スケジュール実行を待つ
5. ✅ 定期的にログを確認

