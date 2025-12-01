import os
import time
import csv
import glob
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

from pymongo import MongoClient

# 環境変数を読み込む
load_dotenv()

# ========================
# 設定
# ========================
BASE_URL = "https://www.maff.go.jp"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

CATEGORY_LIST_PAGES = [
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/rice.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/noodles.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/soup.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/meat_vegetable.html",
    "/j/keikaku/syokubunka/k_ryouri/search_menu/type/fish.html",
]
CATEGORY_LIST_PAGES = [urljoin(BASE_URL, u) for u in CATEGORY_LIST_PAGES]

# ========================
# MongoDB設定
# ========================
# MONGODB_URIを優先、なければMONGO_URIを試行（後方互換性のため）
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError(
        "MONGODB_URI環境変数が設定されていません。"
        "Heroku環境変数または.envファイルでMONGODB_URIを設定してください。"
    )
DB_NAME = os.getenv("DB_NAME", "recipe")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "recipes")


# ========================
# ユーティリティ関数
# ========================
def get_soup(url: str) -> BeautifulSoup:
    """requestsでHTMLを取得してBeautifulSoupオブジェクトを返す"""
    print(f"[GET] {url}")
    res = requests.get(url, headers=HEADERS, timeout=15)
    res.encoding = res.apparent_encoding
    res.raise_for_status()
    return BeautifulSoup(res.text, "html.parser")


def parse_ingredients(soup: BeautifulSoup):
    """
    詳細ページから材料 + 分量をパース
    構造例:
    <ul class="menu_material clm2 mt10">
      <li>
        <ul class="list">
          <li>米</li>
          <li>450g（3合）</li>
        </ul>
      </li>
      ...
    """
    result = []
    ul = soup.select_one("ul.menu_material")
    if not ul:
        return result

    # 各材料ブロック(li)
    for outer in ul.find_all("li", recursive=False):
        inner = outer.find("ul", class_="list")
        if not inner:
            continue
        lis = inner.find_all("li")
        if len(lis) >= 2:
            name = lis[0].get_text(strip=True)
            amount = lis[1].get_text(strip=True)
            if name or amount:
                result.append({"name": name, "amount": amount})
    return result


def parse_cooking_method(soup: BeautifulSoup) -> str:
    """
    作り方セクションをパース
    構造例:
    <h2 class="tit05 mt50">作り方</h2>
    <ul class="recipe mt10">
      <li>
        <div class="num">1</div>
        <div class="txt">活きの良いサワラを3枚におろし、中骨にそって包丁を入れ節にとる。</div>
      </li>
      <li>
        <div class="num">2</div>
        <div class="txt">刺身に切って刺身の3％の塩をあて20分位おいた後、さっと洗い水気を取り、酢に1時間くらいつける。身の中まで白くなるほど酢でしめること。</div>
      </li>
      ...
    </ul>
    """
    # "作り方"タイトルを探す
    h2 = soup.find("h2", class_="tit05", string=lambda text: text and "作り方" in text)
    if not h2:
        # 他の形式も試行: h2内に"作り方"テキストが含まれている場合
        for h in soup.find_all("h2", class_="tit05"):
            if h.get_text(strip=True) and "作り方" in h.get_text():
                h2 = h
                break
    
    if not h2:
        return ""
    
    # 次の兄弟要素からul.recipeを探す
    recipe_ul = None
    for sibling in h2.find_next_siblings():
        if sibling.name == "ul" and "recipe" in sibling.get("class", []):
            recipe_ul = sibling
            break
        # 他のh2やタイトルが出たら中断
        if sibling.name in ["h2", "h3", "h4"]:
            break
    
    if not recipe_ul:
        return ""
    
    # 各ステップ(li)からテキストを抽出
    steps = []
    for li in recipe_ul.find_all("li", recursive=False):
        # numとtxt divを探す
        txt_div = li.find("div", class_="txt")
        if txt_div:
            step_text = txt_div.get_text(strip=True)
            if step_text:
                steps.append(step_text)
    
    # ステップごとに番号を付けて返す
    if steps:
        return "\n".join([f"{i+1}. {step}" for i, step in enumerate(steps)])
    
    return ""


def ingredients_to_string(ing_list):
    """
    DBに保存されたingredientsリストを
    CSV/Excel用文字列に変換
    例: 米：450g（3合）\n水：630ml ...
    """
    if not ing_list:
        return ""
    lines = []
    for item in ing_list:
        name = (item.get("name") or "").strip()
        amount = (item.get("amount") or "").strip()
        if name and amount:
            lines.append(f"{name}：{amount}")
        elif name:
            lines.append(name)
    return "\n".join(lines)


def get_section_clean(soup: BeautifulSoup, keyword: str) -> str:
    """
    '主な使用食材', '飲食方法'のようなセクションからテキストを抽出。
    歴史/由来/時季/保存など他の説明が混ざって入ってくるのを
    一部切り取るための簡単なフィルターも含む。
    """
    header = None

    # まずh3から探す
    for h in soup.find_all("h3"):
        if keyword in h.get_text():
            header = h
            break

    # なければh4でも試行
    if not header:
        for h in soup.find_all("h4"):
            if keyword in h.get_text():
                header = h
                break

    if not header:
        return ""

    texts = []

    # 構造が<li><h3>タイトル</h3> ... </li>の場合が多いので、まずparent li基準で取得
    li = header.find_parent("li")
    if li:
        # 該当li内でp / ul / olのみテキストとして使用
        for t in li.find_all(["p", "ul", "ol"], recursive=False):
            texts.append(t.get_text(" ", strip=True))
    else:
        # もしかしたらliでない場合は次の兄弟要素からp / ul / olを収集
        for sib in header.find_next_siblings():
            if sib.name in ["h3", "h4"]:
                break
            if sib.name in ["p", "ul", "ol"]:
                texts.append(sib.get_text(" ", strip=True))

    text = "\n".join(texts).strip()

    # 不要な長い説明を切り取る（簡単な防御）
    for cut in ["歴史", "由来", "時季", "関連", "保存", "継承", "取組"]:
        idx = text.find(cut)
        if idx != -1:
            text = text[:idx].strip()

    return text


def collect_top5_from_category(cat_url: str, refresh_max: int = 20):
    """
    カテゴリーページでランダムに表示されるレシピを何度もリフレッシュして
    最大5個まで詳細ページURLを収集
    """
    print(f"\n🔹 カテゴリーリスト収集: {cat_url}")

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-breakpad")
    options.add_argument("--disable-client-side-phishing-detection")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-features=TranslateUI")
    options.add_argument("--disable-hang-monitor")
    options.add_argument("--disable-ipc-flooding-protection")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--disable-prompt-on-repost")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-sync")
    options.add_argument("--disable-translate")
    options.add_argument("--metrics-recording-only")
    options.add_argument("--no-first-run")
    options.add_argument("--safebrowsing-disable-auto-update")
    options.add_argument("--enable-automation")
    options.add_argument("--password-store=basic")
    options.add_argument("--use-mock-keychain")
    options.add_argument("--window-size=1920,1080")
    
    # Heroku環境でのChromeDriverパス設定
    # heroku-buildpack-chrome-for-testingが設定する環境変数を優先
    chrome_binary = os.getenv("GOOGLE_CHROME_BIN") or os.getenv("CHROME_BIN")
    chromedriver_path = os.getenv("CHROMEDRIVER_PATH") or os.getenv("CHROMEDRIVER_BIN")
    
    # Heroku buildpackがインストールしたChromeのデフォルトパス
    # chrome-for-testing buildpackのパスを優先
    if not chrome_binary:
        default_chrome_paths = [
            "/app/.chrome-for-testing/chrome-linux64/chrome",  # chrome-for-testing (直接パス)
            "/app/.chrome-for-testing/chrome/linux-*/chrome-linux64/chrome",  # chrome-for-testing (glob)
            "/app/.chromedriver/bin/google-chrome",  # 旧buildpack
            "/usr/bin/google-chrome",
        ]
        for path_pattern in default_chrome_paths:
            if "*" in path_pattern:
                # globパターンの場合
                matches = glob.glob(path_pattern)
                if matches:
                    chrome_binary = matches[0]
                    break
            elif os.path.exists(path_pattern):
                chrome_binary = path_pattern
                break
    
    if chrome_binary:
        options.binary_location = chrome_binary
        print(f"  🔧 Chrome binary: {chrome_binary}")
    
    # Heroku環境でのChromeDriver Service設定
    # chrome-for-testing buildpackのパスを優先
    if not chromedriver_path:
        default_chromedriver_paths = [
            "/app/.chrome-for-testing/chromedriver-linux64/chromedriver",  # chrome-for-testing (直接パス)
            "/app/.chrome-for-testing/chromedriver/linux-*/chromedriver-linux64/chromedriver",  # chrome-for-testing (glob)
            "/app/.chromedriver/bin/chromedriver",  # 旧buildpack
            "/usr/local/bin/chromedriver",
            "/app/vendor/chromedriver/bin/chromedriver",
        ]
        for path_pattern in default_chromedriver_paths:
            if "*" in path_pattern:
                # globパターンの場合
                matches = glob.glob(path_pattern)
                if matches:
                    chromedriver_path = matches[0]
                    print(f"  🔍 Found ChromeDriver at: {chromedriver_path}")
                    break
            elif os.path.exists(path_pattern):
                chromedriver_path = path_pattern
                print(f"  🔍 Found ChromeDriver at: {chromedriver_path}")
                break
    
    if chromedriver_path and os.path.exists(chromedriver_path):
        service = Service(chromedriver_path)
        print(f"  🔧 Using ChromeDriver: {chromedriver_path}")
        try:
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            print(f"  ❌ Failed to start Chrome with Service: {e}")
            print("  ⚠️  Falling back to default ChromeDriver")
            driver = webdriver.Chrome(options=options)
    else:
        # ローカル環境ではデフォルトのChromeDriverを使用
        print("  ⚠️  ChromeDriver path not found, using default")
        print("  💡 Make sure Chrome buildpacks are added to Heroku")
        try:
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f"  ❌ Failed to start Chrome: {e}")
            raise

    urls = set()
    no_new = 0

    try:
        for i in range(refresh_max):
            driver.get(cat_url)
            time.sleep(2)

            sections = driver.find_elements(By.CSS_SELECTOR, "div[id^='SearchMenu']")
            if not sections:
                print("  [WARN] SearchMenuセクションが見つかりません")
                break

            sec_id = sections[0].get_attribute("id")

            cards = driver.find_elements(
                By.CSS_SELECTOR, f"div#{sec_id} div.list p.tit a[href]"
            )

            before = len(urls)
            for c in cards:
                href = c.get_attribute("href")
                if href:
                    urls.add(href)

            added = len(urls) - before
            print(f"  ↺ {i+1}回リフレッシュ: +{added}個（累計 {len(urls)}個）")

            if added == 0:
                no_new += 1
            else:
                no_new = 0

            if no_new >= 3:
                print("  ✅ 新しいURLがもうないため終了")
                break

            if len(urls) >= 5:
                print("  ✅ 5個以上収集完了")
                break

    finally:
        driver.quit()

    urls = list(urls)[:5]
    print(f"  ➤ 最終選択されたURL {len(urls)}個")
    return urls


def scrape_detail_page(url: str) -> dict:
    """
    詳細ページから必要なデータを抽出:
    - title (料理名)
    - main_image (代表画像URL)
    - main_ingredients (主な使用食材セクションテキスト)
    - eating_method (飲食方法セクションテキスト)
    - cooking_method (作り方セクションテキスト) - 新規追加
    - ingredients (材料 + 分量リスト)
    - detailUrl (ページURL)
    """
    print(f"[GET 詳細] {url}")
    soup = get_soup(url)

    # タイトル
    title_span = soup.select_one("span.name")
    title = title_span.get_text(strip=True) if title_span else ""

    # メイン画像
    img_tag = soup.select_one("div.menu_main img.resp_img")
    if img_tag and img_tag.get("src"):
        main_image = urljoin(url, img_tag["src"])
    else:
        main_image = ""

    # 主な使用食材 / 飲食方法
    main_ingredients = get_section_clean(soup, "主な使用食材")
    eating_method = get_section_clean(soup, "飲食方法")

    # 作り方
    cooking_method = parse_cooking_method(soup)

    # 材料 + 分量
    ingredients = parse_ingredients(soup)

    return {
        "title": title,
        "main_image": main_image,
        "main_ingredients": main_ingredients,
        "eating_method": eating_method,
        "cooking_method": cooking_method,  # 新規追加
        "ingredients": ingredients,  # DBに配列として保存
        "detailUrl": url,
    }


# ========================
# DB保存
# ========================
def save_to_mongo(rows):
    """
    MongoDBにupsertで保存
    - key: detailUrl
    - 重複の場合はscrapeCount増加 + データ更新
    """
    if not rows:
        return

    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=30000,  # 30秒でタイムアウト
        connectTimeoutMS=30000,
    )
    db = client[DB_NAME]
    col = db[COLLECTION_NAME]

    count = 0
    for doc in rows:
        col.update_one(
            {"detailUrl": doc["detailUrl"]},
            {
                "$set": doc,
                "$inc": {"scrapeCount": 1},
                "$setOnInsert": {"createdAt": time.time()},
            },
            upsert=True,
        )
        count += 1

    client.close()
    print(f"💾 MongoDB保存/更新完了: {count}件")


# ========================
# メイン実行
# ========================
def check_existing_recipes(urls: list) -> set:
    """
    MongoDBに既に存在するレシピのURLを確認
    返り値: 既存のURLのセット
    """
    if not urls:
        return set()
    
    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,  # 10秒でタイムアウト
            connectTimeoutMS=10000,
        )
        db = client[DB_NAME]
        col = db[COLLECTION_NAME]
        
        existing = col.find(
            {"detailUrl": {"$in": urls}},
            {"detailUrl": 1}
        )
        existing_urls = {doc["detailUrl"] for doc in existing}
        
        client.close()
        return existing_urls
    except Exception as e:
        print(f"⚠️  既存レシピ確認中にエラー: {e}")
        return set()


def main():
    all_rows = []
    total_new_count = 0
    total_existing_count = 0
    no_new_data_categories = 0

    print("=" * 60)
    print("🚀 スクレイピング開始")
    print("=" * 60)

    for cat_url in CATEGORY_LIST_PAGES:
        category_name = cat_url.split("/")[-1].replace(".html", "")  # rice, soupなど
        print(f"\n📂 カテゴリー: {category_name}")
        
        # カテゴリーページからURLを収集
        links = collect_top5_from_category(cat_url, refresh_max=20)
        
        if not links:
            print(f"  ⚠️  {category_name}カテゴリーからURLが見つかりませんでした")
            no_new_data_categories += 1
            continue

        # 既存のレシピを確認
        existing_urls = check_existing_recipes(links)
        new_links = [link for link in links if link not in existing_urls]
        
        print(f"  📊 収集URL: {len(links)}個")
        print(f"  ✅ 新規URL: {len(new_links)}個")
        print(f"  🔄 既存URL: {len(existing_urls)}個")

        # 新しいデータがない場合
        if not new_links:
            print(f"  ⏸️  {category_name}カテゴリーには新しいデータがありません。スキップします。")
            no_new_data_categories += 1
            total_existing_count += len(existing_urls)
            
            # すべてのカテゴリーで新しいデータがない場合、早期終了
            if no_new_data_categories >= len(CATEGORY_LIST_PAGES):
                print("\n" + "=" * 60)
                print("⏹️  すべてのカテゴリーで新しいデータがありません。")
                print("   スクレイピングを終了します。")
                print("=" * 60)
                return
            continue

        # 新しいレシピをスクレイピング
        category_new_count = 0
        for link in new_links:
            try:
                data = scrape_detail_page(link)
                data["category"] = category_name
                all_rows.append(data)
                category_new_count += 1
                total_new_count += 1
                time.sleep(1)
            except Exception as e:
                print(f"  ❌ エラー: {link} のスクレイピングに失敗: {e}")
                continue

        total_existing_count += len(existing_urls)
        print(f"  ✅ {category_name}カテゴリー: 新規 {category_new_count}件を追加")

    # 新しいデータがない場合
    if not all_rows:
        print("\n" + "=" * 60)
        print("⏹️  新しいデータがありませんでした。")
        print(f"   既存レシピ: {total_existing_count}件")
        print("   スクレイピングを終了します。")
        print("=" * 60)
        return

    # DB保存
    print(f"\n🔥 合計 {len(all_rows)}件の新規データをDBにupsert")
    save_to_mongo(all_rows)

    # CSVバックアップ生成
    file = "maff_recipe_top5_each_category.csv"
    keys = [
        "title",
        "main_image",
        "main_ingredients",
        "eating_method",
        "cooking_method",  # 新規追加
        "ingredients",   # 材料+分量を文字列に変換して入れる
        "detailUrl",
        "category",
    ]

    with open(file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for row in all_rows:
            out = {k: row.get(k, "") for k in keys}
            # ingredientsはリスト → 文字列に変換
            out["ingredients"] = ingredients_to_string(row.get("ingredients", []))
            writer.writerow(out)

    print(f"\n✅ スクレイピング + DB保存 + CSVバックアップ完了!")
    print(f"   → 新規データ: {len(all_rows)}件")
    print(f"   → 既存データ: {total_existing_count}件")
    print(f"   → CSVファイル: {file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
