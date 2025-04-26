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

  describe('root', () => {
    it('controller should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should redirect to /api', () => {
      const result = appController.root();
      expect(result).toBeUndefined();
    });
  });
});
