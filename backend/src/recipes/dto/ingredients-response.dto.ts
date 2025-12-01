import { ApiProperty } from '@nestjs/swagger';

/**
 * 材料一覧レスポンスDTO
 * すべてのレシピから抽出したユニークな材料名のリスト
 */
export class IngredientsResponseDto {
  /**
   * 材料名の配列（重複なし、五十音順）
   */
  @ApiProperty({
    description: '材料名の配列（重複なし、五十音順）',
    type: [String],
    example: ['米', '鶏肉', 'ごぼう', 'そば粉', '小麦粉'],
  })
  ingredients: string[];
}

