import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface ServerTimeBody {
  serverTime: string;
  isoTime: string;
  timezone: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/time (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/time')
      .expect(200)
      .expect(({ body }) => {
        const serverTime = body as ServerTimeBody;

        expect(body).toHaveProperty('serverTime');
        expect(body).toHaveProperty('isoTime');
        expect(serverTime.timezone).toBe('Asia/Seoul');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
