import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * アプリケーションのエントリーポイント
 * NestJSアプリケーションを起動する
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS設定（フロントエンドからのリクエストを許可）
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'https://47-kitchen.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // originがundefinedの場合は許可（Postmanなどのツールからのリクエスト）
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policyで許可されていません'));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 サーバーが起動しました: http://localhost:${port}`);
}

bootstrap();

