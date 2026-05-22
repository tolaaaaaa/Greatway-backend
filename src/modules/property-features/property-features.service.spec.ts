import { Test, TestingModule } from '@nestjs/testing';
import { PropertyFeaturesService } from './property-features.service';

describe('PropertyFeaturesService', () => {
  let service: PropertyFeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyFeaturesService],
    }).compile();

    service = module.get<PropertyFeaturesService>(PropertyFeaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
