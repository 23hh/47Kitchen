# レシピデータスクレイピングスクリプト

日本全国郷土料理レシピを収集するPythonスクレイピングスクリプト

## セットアップ

### 1. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

必要なパッケージ：
- `requests`
- `beautifulsoup4`
- `selenium`
- `pymongo`

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
DB_NAME=recipe
COLLECTION_NAME=recipes
```

> 💡 `.env.example`ファイルを参考にしてください。  
> ⚠️ **重要**: `.env`ファイルはGitにコミットしないでください。

### 3. 実行

```bash
python scraper.py
```

## 機能

- カテゴリー別レシピ収集（ご飯、麺、汁物、肉・野菜、魚）
- 各カテゴリーから最大5件のレシピを収集
- MongoDB Atlasへの自動保存
- 重複チェック（`detailUrl`ベース）
- CSVバックアップ生成

## 注意事項

⚠️ **スクレイピングを実行する前に、対象サイトの利用規約を確認してください。**

- 過度なリクエストを避けるため、適切な待機時間を設定
- サーバーに負荷をかけないよう注意
- 個人利用・学習目的でのみ使用してください

## データ構造

収集されるデータ：
- `title`: レシピタイトル
- `main_image`: メイン画像URL
- `main_ingredients`: 主な材料
- `eating_method`: 食べ方・作り方
- `cooking_method`: 作り方（調理手順）
- `ingredients`: 詳細な材料リスト
- `category`: カテゴリー
- `detailUrl`: 元のレシピページURL

