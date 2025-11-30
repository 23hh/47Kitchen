# config.py
import os
from urllib.parse import urljoin
from dotenv import load_dotenv

# 環境変数を読み込む
load_dotenv()

# ===== MongoDB =====
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/")
DB_NAME = os.getenv("DB_NAME", "recipe")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "recipes")

# ===== スクレイピング基本設定 =====
BASE_URL = "https://www.maff.go.jp"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

# カテゴリー別リストページ（相対パス → 絶対パスに変換）
REL_CATEGORY_PATHS = [
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/rice.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/noodles.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/soup.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/meat_vegetable.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/fish.html",
]

CATEGORY_LIST_PAGES = [urljoin(BASE_URL, p) for p in REL_CATEGORY_PATHS]
