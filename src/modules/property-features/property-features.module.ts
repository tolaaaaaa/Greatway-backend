import { Module } from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { PropertyFeaturesController } from './property-features.controller';
import { PropertyFeature } from './entities/property-feature.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyFeature])],
  controllers: [PropertyFeaturesController],
  providers: [PropertyFeaturesService],
  exports: [PropertyFeaturesService]
})
export class PropertyFeaturesModule {}
