import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /api/time', () => {
    it('should return the current server time', () => {
      const result = appController.getServerTime();

      expect(result).toHaveProperty('serverTime');
      expect(result).toHaveProperty('isoTime');
      expect(result.timezone).toBe('Asia/Seoul');
    });
  });
});
