import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Recipe } from './schemas/recipe.schema';
import { SearchRecipesDto } from './dto/search-recipes.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { RecipeDetailResponseDto } from './dto/recipe-detail-response.dto';
import { IngredientsResponseDto } from './dto/ingredients-response.dto';

/**
 * レシピコントローラー
 * レシピ関連のAPIエンドポイントを定義
 */
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * すべてのレシピから抽出したユニークなメイン材料名のリストを取得
   * GET /ingredients
   * 
   * すべてのレシピのmain_ingredientsフィールドから材料名を抽出し、
   * 重複を排除して五十音順にソートして返す
   * 
   * @returns メイン材料名のリスト
   */
  @Get('ingredients')
  async getAllIngredients(): Promise<IngredientsResponseDto> {
    return this.recipesService.getAllIngredients();
  }

  /**
   * すべてのレシピを取得
   * GET /recipes
   */
  @Get()
  async findAll(): Promise<Recipe[]> {
    return this.recipesService.findAll();
  }

  /**
   * 材料とカテゴリーでレシピを検索
   * GET /recipes/search?ingredients=そば粉,小麦粉&category=noodles&limit=10&skip=0
   *
   * @param searchDto 検索条件（クエリパラメータから自動的にマッピング）
   * @returns 条件に一致するレシピの配列（必要なフィールドのみ）
   */
  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRecipes(
    @Query() searchDto: SearchRecipesDto,
  ): Promise<RecipeResponseDto[]> {
    return this.recipesService.searchRecipes(searchDto);
  }

  /**
   * 材料とカテゴリーでレシピを検索（マッチした材料数でソート）
   * GET /recipes/search/sorted?ingredients=そば粉,小麦粉&category=noodles&limit=10&skip=0
   *
   * マッチした材料数が多い順にソートされる
   *
   * @param searchDto 検索条件（クエリパラメータから自動的にマッピング）
   * @returns 条件に一致するレシピの配列（マッチした材料数が多い順）
   */
  @Get('search/sorted')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRecipesSorted(
    @Query() searchDto: SearchRecipesDto,
  ): Promise<RecipeResponseDto[]> {
    return this.recipesService.searchRecipesWithSort(searchDto);
  }

  /**
   * IDでレシピの詳細情報を取得
   * GET /recipes/:id
   * 
   * @param id レシピID（MongoDB ObjectId）
   * @returns レシピの詳細情報
   * @throws NotFoundException レシピが見つからない場合（404エラー）
   * 
   * 注意: このルートは最後に配置する必要があります。
   * そうしないと、/recipes/search が /recipes/:id にマッチしてしまいます。
   */
  @Get(':id')
  async findOneById(@Param('id') id: string): Promise<RecipeDetailResponseDto> {
    return this.recipesService.findOneById(id);
  }
}
