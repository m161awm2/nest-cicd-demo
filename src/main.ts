import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // EC2 외부 접속을 위해 모든 네트워크 인터페이스에서 요청을 받습니다.
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`NestJS CI/CD Demo is running on http://0.0.0.0:${port}`);
}

void bootstrap();
