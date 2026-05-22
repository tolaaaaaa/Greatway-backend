import { Injectable } from '@nestjs/common';
import { PropertiesService } from '../properties/properties.service';
import { GalleriesService } from '../galleries/galleries.service';
import { CareersService } from '../careers/careers.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly galleryService: GalleriesService,
    private readonly careerService: CareersService
  ) {}

  async analystics() {
    const [propertyResult, galleryResult, careerResult] = await Promise.all([
      this.propertiesService.find({}),
      this.galleryService.find({}),
      this.careerService.find({ status: "open" })
    ]);

    const [__properties, propertyCount] = propertyResult;
    const [__gallery, galleryCount] = galleryResult;
    const [__career, careerCount] = careerResult;

    return {
      propertyCount,
      galleryCount,
      careerCount
    };
  }
}