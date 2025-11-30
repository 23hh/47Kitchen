# レシピ検索API 使用例

## 基本的な検索

### 材料のみで検索
```
GET /recipes/search?ingredients=そば粉,小麦粉
```

### 材料とカテゴリーで検索
```
GET /recipes/search?ingredients=鶏肉,ごぼう&category=rice
```

### ページネーション付き検索
```
GET /recipes/search?ingredients=米&limit=10&skip=0
```

## マッチした材料数でソート

マッチした材料数が多い順にソートする場合は、`/recipes/search/sorted` エンドポイントを使用します。

```
GET /recipes/search/sorted?ingredients=そば粉,小麦粉,水&category=noodles&limit=10
```

このエンドポイントは、指定された材料のうち、より多くの材料が含まれているレシピを優先的に返します。

## レスポンス形式

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "鶏めし（とりめし）",
    "main_image": "https://www.maff.go.jp/...",
    "main_ingredients": "鶏肉、ごぼう、米",
    "category": "rice"
  }
]
```

