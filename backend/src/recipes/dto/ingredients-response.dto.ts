/**
 * 材料一覧レスポンスDTO
 * すべてのレシピから抽出したユニークな材料名のリスト
 */
export class IngredientsResponseDto {
  /**
   * 材料名の配列（重複なし、五十音順）
   */
  ingredients: string[];
}

