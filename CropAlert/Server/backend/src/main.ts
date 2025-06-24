import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS and allow requests from your frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // frontend URLs
    credentials: true,               // if you're using cookies/auth headers
  });

  await app.listen(process.env.PORT ?? 3000); // backend runs on 3000 inside container
}
bootstrap();
