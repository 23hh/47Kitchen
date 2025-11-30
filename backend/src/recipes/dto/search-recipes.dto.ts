import { IsOptional, IsString, IsEnum, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsNotEmpty()
  @IsString()
  ingredients: string;

  /**
   * カテゴリーでフィルタリング（オプション）
   */
  @IsOptional()
  @IsEnum(RecipeCategory)
  category?: RecipeCategory;

  /**
   * ページネーション: 取得件数の上限（オプション）
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /**
   * ページネーション: スキップする件数（オプション）
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

