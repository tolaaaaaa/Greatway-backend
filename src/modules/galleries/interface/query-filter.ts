import { PaginationParams } from 'src/services/pagination';
import { FindOptionsWhere } from 'typeorm';
import { Gallery } from '../entities/gallery.entity';

export interface IGallerysQuery
  extends PaginationParams, FindOptionsWhere<Gallery> {}
