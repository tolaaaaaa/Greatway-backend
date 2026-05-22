import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Gallery } from '../entities/gallery.entity';
import { GalleryResponseMapper } from '../interface/gallery-response-mapper.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable } from 'rxjs';
import { IGallerysResponse } from '../interface/galleries-response.interface';
import { IGalleryResponse } from '../interface/gallery-reponse.interface';

type Payload = [Gallery[], number];

@Injectable()
export class GallerysInterceptor
  extends GalleryResponseMapper
  implements NestInterceptor<Payload, IGallerysResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<IGallerysResponse> | Promise<Observable<IGallerysResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate(
    [galleries, total]: Payload,
    params: PaginationParams,
  ): IGallerysResponse {
    const data = galleries.map((gallery) => this.transform(gallery));
    return this.paginationService.paginate<IGalleryResponse>(
      data,
      total,
      params,
    );
  }
}