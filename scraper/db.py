# db.py
import time
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URI, DB_NAME, COLLECTION_NAME

# グローバルクライアント: プログラム開始～終了まで1つだけ使用
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION_NAME]


async def bulk_upsert(rows: list):
    """rowsリストをdetailUrl基準でupsert"""
    if not rows:
        return

    print(f"🗄  DB upsert開始: {len(rows)}件")
    try:
        tasks = []
        for r in rows:
            tasks.append(
                col.update_one(
                    {"detailUrl": r["detailUrl"]},
                    {
                        "$set": r,
                        "$inc": {"scrapeCount": 1},
                        "$setOnInsert": {"createdAt": time.time()},
                    },
                    upsert=True,
                )
            )

        results = await asyncio.gather(*tasks)
        inserted = sum(1 for r in results if r.upserted_id is not None)
        modified = sum(r.modified_count for r in results)
        print(f"✅ upsert完了: inserted={inserted}, modified={modified}")
    except Exception as e:
        print("❌ DB upsert中エラー:", repr(e))


async def print_collection_count():
    """現在のコレクションに何件あるか出力"""
    try:
        total = await col.count_documents({})
        print(f"📊 MongoDB '{DB_NAME}.{COLLECTION_NAME}' 文書数: {total}件")
    except Exception as e:
        print("❌ count_documents中エラー:", repr(e))


def close_client():
    """プログラム終了時にクライアントを閉じる"""
    client.close()
