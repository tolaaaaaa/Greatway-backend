import { Test, TestingModule } from '@nestjs/testing';
import { PropertyFeaturesController } from './property-features.controller';
import { PropertyFeaturesService } from './property-features.service';

describe('PropertyFeaturesController', () => {
  let controller: PropertyFeaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyFeaturesController],
      providers: [PropertyFeaturesService],
    }).compile();

    controller = module.get<PropertyFeaturesController>(PropertyFeaturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
