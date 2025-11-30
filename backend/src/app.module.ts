import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesModule } from './recipes/recipes.module';

/**
 * アプリケーションのルートモジュール
 * すべての機能モジュールを統合する
 */
@Module({
  imports: [
    // 環境変数の設定
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // 複数のパスを試行
      expandVariables: true, // 環境変数の展開を有効化
    }),
    // MongoDB Atlasへの接続（ConfigServiceを使用して環境変数を読み込む）
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          throw new Error(
            'MONGODB_URI環境変数が設定されていません。.envファイルを確認してください。',
          );
        }
        
        // MongoDB接続オプション（IPv4を強制使用してIPv6接続問題を回避）
        return {
          uri,
          dbName: 'recipe',
          retryWrites: true,
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          family: 4, // IPv4を強制使用
        };
      },
      inject: [ConfigService],
    }),
    // レシピ機能モジュール
    RecipesModule,
  ],
})
export class AppModule {}

