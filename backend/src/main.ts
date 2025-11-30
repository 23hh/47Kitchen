import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * アプリケーションのエントリーポイント
 * NestJSアプリケーションを起動する
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS設定（フロントエンドからのリクエストを許可）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 サーバーが起動しました: http://localhost:${port}`);
}

bootstrap();

