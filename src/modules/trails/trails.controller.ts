import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TrailsService } from './trails.service';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { FindAllTrailsSwagger, FindOneTrailSwagger } from './docs/trail.docs';
import { TrailInterceptor } from './interceptor/trail.interceptor';
import { TrailsInterceptor } from './interceptor/trails.interceptor';
import type { ITrailsQuery } from './interface/query-filter';

@Controller('trails')
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Get()
  @FindAllTrailsSwagger()
  @UseInterceptors(TrailsInterceptor)
  async findAll(@Query() query: ITrailsQuery) {
    const result = await this.trailsService.find(query);

    return result;
  }

  @Get(':id')
  @FindOneTrailSwagger()
  @UseInterceptors(TrailInterceptor)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const trail = await this.trailsService.findById(id);
    if (!trail) throw new NotFoundException('Trail not found');
    return trail;
  }
}
