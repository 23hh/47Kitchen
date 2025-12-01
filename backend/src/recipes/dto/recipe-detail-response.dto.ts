import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * レシピ詳細レスポンスDTO
 * レシピの全情報を返す
 */
export class RecipeDetailResponseDto {
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
   * 主な材料（カンマ区切り）
   */
  @ApiProperty({
    description: '主な材料（カンマ区切り）',
    example: '鶏肉、ごぼう、米',
  })
  main_ingredients: string;

  /**
   * 作り方・食べ方の説明
   */
  @ApiProperty({
    description: '作り方・食べ方の説明',
    example: '米と鶏肉、ごぼうを一緒に炊き込んだ料理です。',
  })
  eating_method: string;

  /**
   * 作り方（調理手順）
   * 例: "1. 米を洗い、ざるにあけて水分を切り...\n2. 炊き上がったら..."
   */
  @ApiPropertyOptional({
    description: '作り方（調理手順）',
    example: '1. 米を洗い、ざるにあけて水分を切り...\n2. 炊き上がったら...',
  })
  cooking_method?: string;

  /**
   * 詳細な材料リスト
   * 配列形式: [{name: "米", amount: "3カップ"}, ...]
   * または文字列形式: "米：2合\n地鶏：150g\nごぼう：120g"
   */
  @ApiProperty({
    description: '詳細な材料リスト',
    example: [{ name: '米', amount: '3カップ' }, { name: '地鶏', amount: '150g' }],
    oneOf: [
      { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, amount: { type: 'string' } } } },
      { type: 'string' },
    ],
  })
  ingredients: Array<{ name: string; amount: string }> | string;

  /**
   * カテゴリー
   */
  @ApiProperty({
    description: 'カテゴリー',
    example: 'rice',
    enum: ['rice', 'noodles', 'soup', 'meat_vegetable', 'fish'],
  })
  category: string;

  /**
   * 詳細ページのURL
   */
  @ApiProperty({
    description: '詳細ページのURL',
    example: 'https://www.maff.go.jp/...',
  })
  detailUrl: string;

  /**
   * スクレイピング回数
   */
  @ApiPropertyOptional({
    description: 'スクレイピング回数',
    example: 1,
    type: Number,
  })
  scrapeCount?: number;

  /**
   * 作成日時
   */
  @ApiPropertyOptional({
    description: '作成日時',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt?: Date;

  /**
   * 更新日時
   */
  @ApiPropertyOptional({
    description: '更新日時',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt?: Date;
}

