import { Module } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { TrailsController } from './trails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trail } from './entities/trail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trail])],
  controllers: [TrailsController],
  providers: [TrailsService],
  exports: [TrailsService]
})
export class TrailsModule {}
