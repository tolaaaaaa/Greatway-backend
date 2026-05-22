import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { GalleriesModule } from '../galleries/galleries.module';
import { CareersModule } from '../careers/careers.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [GalleriesModule, CareersModule, PropertiesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
