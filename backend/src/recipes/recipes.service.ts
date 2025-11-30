import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { SearchRecipesDto, RecipeCategory } from './dto/search-recipes.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { RecipeDetailResponseDto } from './dto/recipe-detail-response.dto';
import { IngredientsResponseDto } from './dto/ingredients-response.dto';

/**
 * レシピサービスクラス
 * レシピデータの取得・検索ロジックを実装
 */
@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
  ) {}

  /**
   * すべてのレシピを取得
   * @returns レシピの配列
   */
  async findAll(): Promise<Recipe[]> {
    return this.recipeModel.find().exec();
  }

  /**
   * IDでレシピの詳細情報を取得
   * @param id レシピID（MongoDB ObjectId）
   * @returns レシピの詳細情報
   * @throws NotFoundException レシピが見つからない場合
   */
  async findOneById(id: string): Promise<RecipeDetailResponseDto> {
    const recipe = await this.recipeModel.findById(id).exec();

    if (!recipe) {
      throw new NotFoundException(`ID "${id}" のレシピが見つかりませんでした`);
    }

    // レスポンスDTOに変換
    return {
      _id: recipe._id.toString(),
      title: recipe.title,
      main_image: recipe.main_image || '',
      main_ingredients: recipe.main_ingredients || '',
      eating_method: recipe.eating_method || '',
      cooking_method: recipe.cooking_method || '',
      ingredients: recipe.ingredients || [],
      category: recipe.category || '',
      detailUrl: recipe.detailUrl,
      scrapeCount: recipe.scrapeCount,
      createdAt: recipe.createdAt,
      updatedAt: (recipe as any).updatedAt,
    };
  }

  /**
   * IDでレシピを取得（後方互換性のため残す）
   * @param id レシピID
   * @returns レシピ
   */
  async findOne(id: string): Promise<Recipe> {
    return this.recipeModel.findById(id).exec();
  }

  /**
   * 材料に基づいてレシピを検索
   * @param ingredients 検索する材料の配列
   * @returns 条件に一致するレシピの配列
   */
  async findByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (!ingredients || ingredients.length === 0) {
      return this.findAll();
    }

    // main_ingredientsまたはingredientsフィールドに指定された材料が含まれるレシピを検索
    const searchRegex = ingredients.map(
      (ingredient) => new RegExp(ingredient, 'i'),
    );

    return this.recipeModel
      .find({
        $or: [
          { main_ingredients: { $in: searchRegex } },
          { ingredients: { $in: searchRegex } },
        ],
      })
      .exec();
  }

  /**
   * カテゴリーでレシピを検索
   * @param category カテゴリー名
   * @returns 条件に一致するレシピの配列
   */
  async findByCategory(category: string): Promise<Recipe[]> {
    return this.recipeModel.find({ category }).exec();
  }

  /**
   * 材料とカテゴリーでレシピを検索（拡張可能なクエリビルダー）
   * @param searchDto 検索条件DTO
   * @returns 条件に一致するレシピの配列（必要なフィールドのみ）
   */
  async searchRecipes(
    searchDto: SearchRecipesDto,
  ): Promise<RecipeResponseDto[]> {
    // 材料文字列を配列に変換
    const ingredientsArray = searchDto.ingredients
      .split(',')
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);

    if (ingredientsArray.length === 0) {
      throw new Error('材料が指定されていません');
    }

    // クエリビルダーを構築
    const query: any = {};

    // 材料検索条件: main_ingredientsフィールドのみで検索
    // main_ingredientsフィールドの形式: "鶏肉、ごぼう、米" (カンマ区切り)
    const ingredientRegexArray = ingredientsArray.map(
      (ingredient) => new RegExp(ingredient, 'i'),
    );

    // main_ingredientsフィールドに指定された材料が含まれるレシピを検索
    query.main_ingredients = { $in: ingredientRegexArray };

    // カテゴリーフィルター（オプション）
    if (searchDto.category) {
      query.category = searchDto.category;
    }

    // クエリ実行（ページネーション対応）
    const queryBuilder = this.recipeModel.find(query);

    if (searchDto.skip !== undefined) {
      queryBuilder.skip(searchDto.skip);
    }

    if (searchDto.limit !== undefined) {
      queryBuilder.limit(searchDto.limit);
    }

    // 必要なフィールドのみを選択
    const recipes = await queryBuilder
      .select('_id title main_image main_ingredients category')
      .exec();

    return recipes.map((recipe) => ({
      _id: recipe._id.toString(),
      title: recipe.title,
      main_image: recipe.main_image,
      main_ingredients: recipe.main_ingredients,
      category: recipe.category,
    }));
  }

  /**
   * 材料とカテゴリーでレシピを検索（マッチした材料数でソート）
   * @param searchDto 検索条件DTO
   * @returns 条件に一致するレシピの配列（マッチした材料数が多い順）
   */
  async searchRecipesWithSort(
    searchDto: SearchRecipesDto,
  ): Promise<RecipeResponseDto[]> {
    // 材料文字列を配列に変換
    const ingredientsArray = searchDto.ingredients
      .split(',')
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);

    if (ingredientsArray.length === 0) {
      throw new Error('材料が指定されていません');
    }

    // クエリビルダーを構築
    const query: any = {};

    // 材料検索条件: main_ingredientsフィールドのみで検索
    const ingredientRegexArray = ingredientsArray.map(
      (ingredient) => new RegExp(ingredient, 'i'),
    );

    // main_ingredientsフィールドに指定された材料が含まれるレシピを検索
    query.main_ingredients = { $in: ingredientRegexArray };

    // カテゴリーフィルター（オプション）
    if (searchDto.category) {
      query.category = searchDto.category;
    }

      // すべてのレシピを取得（ソート用）
      const allRecipes = await this.recipeModel
        .find(query)
        .select('_id title main_image main_ingredients category')
        .exec();

      // マッチした材料数を計算してソート
      const recipesWithMatchCount = allRecipes.map((recipe) => {
        let matchCount = 0;

        // main_ingredientsフィールドのみをチェック
        const mainIngredientsText = recipe.main_ingredients || '';

        ingredientsArray.forEach((searchIngredient) => {
          const regex = new RegExp(searchIngredient, 'i');
          if (regex.test(mainIngredientsText)) {
            matchCount++;
          }
        });

      return {
        recipe,
        matchCount,
      };
    });

    // マッチした材料数が多い順にソート
    recipesWithMatchCount.sort((a, b) => b.matchCount - a.matchCount);

    // ページネーション適用
    let paginatedRecipes = recipesWithMatchCount;
    if (searchDto.skip !== undefined) {
      paginatedRecipes = paginatedRecipes.slice(searchDto.skip);
    }
    if (searchDto.limit !== undefined) {
      paginatedRecipes = paginatedRecipes.slice(0, searchDto.limit);
    }

    // レスポンス形式に変換
    return paginatedRecipes.map(({ recipe }) => ({
      _id: recipe._id.toString(),
      title: recipe.title,
      main_image: recipe.main_image,
      main_ingredients: recipe.main_ingredients,
      category: recipe.category,
    }));
  }

  /**
   * すべてのレシピからメイン材料名を抽出してユニークなリストを返す
   * 
   * 注意: main_ingredientsフィールドのみから材料名を抽出します。
   * main_ingredientsフィールドの形式: "鶏肉、ごぼう、米" (カンマ区切り)
   * 
   * @returns ユニークなメイン材料名のリスト（五十音順）
   */
  async getAllIngredients(): Promise<IngredientsResponseDto> {
    // すべてのレシピを取得（main_ingredientsフィールドのみ）
    const recipes = await this.recipeModel
      .find({})
      .select('main_ingredients') // main_ingredientsフィールドのみを選択
      .lean() // Mongooseドキュメントではなくプレーンオブジェクトとして取得
      .exec();

    // 材料名と出現回数を記録するMap
    const ingredientsCountMap = new Map<string, number>();

    recipes.forEach((recipe: any) => {
      if (!recipe.main_ingredients) {
        return;
      }

      // main_ingredientsフィールドの形式: "鶏肉、ごぼう、米"
      // カンマまたは読点で分割
      const ingredients = recipe.main_ingredients
        .split(/[、,]/)
        .map((ing: string) => ing.trim())
        .filter((ing: string) => ing.length > 0);

      ingredients.forEach((ingredientName: string) => {
        // 材料名からタグを除去
        // "[...]" 形式（例: "[調味料] しょうゆ" → "しょうゆ"）
        // "【...】" 形式（例: "【A】 だし汁" → "だし汁"）
        let cleanedName = ingredientName
          .replace(/^\[[^\]]+\]\s*/, '')  // [...] 形式を削除
          .replace(/^【[^】]+】\s*/, '')  // 【...】 形式を削除
          .trim();
        
        if (cleanedName) {
          // 出現回数をカウント
          const currentCount = ingredientsCountMap.get(cleanedName) || 0;
          ingredientsCountMap.set(cleanedName, currentCount + 1);
        }
      });
    });

    // Mapを配列に変換
    const ingredientsArray = Array.from(ingredientsCountMap.entries())
      .map(([name, count]) => ({ name, count }));

    // 出現回数が多い順にソート（同じ回数の場合は五十音順）
    ingredientsArray.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; // 出現回数が多い順
      }
      return a.name.localeCompare(b.name, 'ja'); // 同じ回数の場合は五十音順
    });

    // 材料名のみを抽出
    const sortedIngredientNames = ingredientsArray.map(item => item.name);

    return {
      ingredients: sortedIngredientNames,
    };
  }
}

