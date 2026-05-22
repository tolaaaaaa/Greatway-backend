import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertyFeaturesModule } from '../property-features/property-features.module';
import { Property } from './entities/property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsModule } from '../trails/trails.module';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), PropertyFeaturesModule, TrailsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService]
})
export class PropertiesModule {}
