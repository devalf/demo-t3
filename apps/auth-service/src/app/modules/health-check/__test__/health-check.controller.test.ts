import { Test, TestingModule } from '@nestjs/testing';

import { HealthCheckController } from '../health-check.controller';
import { HealthCheckDto } from '../dto';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return { status: "ok" }', () => {
      const result: HealthCheckDto = controller.healthCheck();

      expect(result).toEqual({ status: 'ok' });
    });
  });
});
