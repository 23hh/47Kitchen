import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * レシピドキュメントの型定義
 */
export type RecipeDocument = Recipe & Document;

/**
 * レシピスキーマ定義
 * MongoDB Atlasに保存されている日本全国郷土料理レシピの構造
 */
@Schema({ collection: 'recipes' })
export class Recipe {
  /**
   * レシピのタイトル
   * 例: 鶏めし（とりめし）
   */
  @Prop({ required: true, type: String })
  title: string;

  /**
   * メイン画像のURL
   */
  @Prop({ type: String })
  main_image: string;

  /**
   * 主な材料（カンマ区切り）
   * 例: 鶏肉、ごぼう、米
   */
  @Prop({ type: String })
  main_ingredients: string;

  /**
   * 作り方・食べ方の説明
   */
  @Prop({ type: String })
  eating_method: string;

  /**
   * 作り方（調理手順）
   * 例: "1. 米を洗い、ざるにあけて水分を切り...\n2. 炊き上がったら..."
   */
  @Prop({ type: String })
  cooking_method?: string;

  /**
   * 詳細な材料リスト
   * 配列形式: [{name: "米", amount: "3カップ"}, ...]
   * または文字列形式: "米：2合\n地鶏：150g\nごぼう：120g" (後方互換性)
   */
  @Prop({ type: mongoose.Schema.Types.Mixed })
  ingredients: Array<{ name: string; amount: string }> | string;

  /**
   * 詳細ページのURL
   */
  @Prop({ required: true, unique: true, type: String })
  detailUrl: string;

  /**
   * カテゴリー
   * 例: rice, noodles, soup, meat_vegetable, fish
   */
  @Prop({ type: String })
  category: string;

  /**
   * スクレイピング回数（オプション）
   */
  @Prop({ type: Number, default: 0 })
  scrapeCount?: number;

  /**
   * 作成日時（オプション）
   */
  @Prop({ type: Date })
  createdAt?: Date;
}

/**
 * Recipeスキーマファクトリー
 * Mongooseスキーマを生成する
 */
export const RecipeSchema = SchemaFactory.createForClass(Recipe);

