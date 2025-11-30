/**
 * レシピ詳細レスポンスDTO
 * レシピの全情報を返す
 */
export class RecipeDetailResponseDto {
  /**
   * レシピID
   */
  _id: string;

  /**
   * レシピのタイトル
   */
  title: string;

  /**
   * メイン画像のURL
   */
  main_image: string;

  /**
   * 主な材料（カンマ区切り）
   */
  main_ingredients: string;

  /**
   * 作り方・食べ方の説明
   */
  eating_method: string;

  /**
   * 作り方（調理手順）
   * 例: "1. 米を洗い、ざるにあけて水分を切り...\n2. 炊き上がったら..."
   */
  cooking_method?: string;

  /**
   * 詳細な材料リスト
   * 配列形式: [{name: "米", amount: "3カップ"}, ...]
   * または文字列形式: "米：2合\n地鶏：150g\nごぼう：120g"
   */
  ingredients: Array<{ name: string; amount: string }> | string;

  /**
   * カテゴリー
   */
  category: string;

  /**
   * 詳細ページのURL
   */
  detailUrl: string;

  /**
   * スクレイピング回数
   */
  scrapeCount?: number;

  /**
   * 作成日時
   */
  createdAt?: Date;

  /**
   * 更新日時
   */
  updatedAt?: Date;
}

