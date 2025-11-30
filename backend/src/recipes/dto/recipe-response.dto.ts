/**
 * レシピ検索APIのレスポンスDTO
 * 必要なフィールドのみを返す
 */
export class RecipeResponseDto {
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
   * 主な材料
   */
  main_ingredients: string;

  /**
   * カテゴリー
   */
  category: string;
}

