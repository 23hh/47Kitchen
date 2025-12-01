import { ApiProperty } from '@nestjs/swagger';

/**
 * レシピ検索APIのレスポンスDTO
 * 必要なフィールドのみを返す
 */
export class RecipeResponseDto {
  /**
   * レシピID
   */
  @ApiProperty({
    description: 'レシピID（MongoDB ObjectId）',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  /**
   * レシピのタイトル
   */
  @ApiProperty({
    description: 'レシピのタイトル',
    example: '鶏めし（とりめし）',
  })
  title: string;

  /**
   * メイン画像のURL
   */
  @ApiProperty({
    description: 'メイン画像のURL',
    example: 'https://www.maff.go.jp/...',
    required: false,
  })
  main_image: string;

  /**
   * 主な材料
   */
  @ApiProperty({
    description: '主な材料（カンマ区切り）',
    example: '鶏肉、ごぼう、米',
  })
  main_ingredients: string;

  /**
   * カテゴリー
   */
  @ApiProperty({
    description: 'カテゴリー',
    example: 'rice',
    enum: ['rice', 'noodles', 'soup', 'meat_vegetable', 'fish'],
  })
  category: string;
}

