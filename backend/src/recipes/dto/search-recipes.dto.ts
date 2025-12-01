import { IsOptional, IsString, IsEnum, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * カテゴリーの列挙型
 */
export enum RecipeCategory {
  RICE = 'rice',
  NOODLES = 'noodles',
  SOUP = 'soup',
  MEAT_VEGETABLE = 'meat_vegetable',
  FISH = 'fish',
}

/**
 * レシピ検索リクエストDTO
 * クエリパラメータのバリデーションと型定義
 */
export class SearchRecipesDto {
  /**
   * 検索する材料（カンマ区切り文字列）
   * 例: "そば粉,小麦粉"
   */
  @ApiProperty({
    description: '検索する材料（カンマ区切り）',
    example: 'そば粉,小麦粉',
  })
  @IsNotEmpty()
  @IsString()
  ingredients: string;

  /**
   * カテゴリーでフィルタリング（オプション）
   */
  @ApiPropertyOptional({
    description: 'カテゴリーでフィルタリング',
    enum: RecipeCategory,
    example: RecipeCategory.NOODLES,
  })
  @IsOptional()
  @IsEnum(RecipeCategory)
  category?: RecipeCategory;

  /**
   * ページネーション: 取得件数の上限（オプション）
   */
  @ApiPropertyOptional({
    description: '取得件数の上限',
    type: Number,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /**
   * ページネーション: スキップする件数（オプション）
   */
  @ApiPropertyOptional({
    description: 'スキップする件数（ページネーション用）',
    type: Number,
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

