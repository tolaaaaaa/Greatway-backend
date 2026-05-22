import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GalleryResponseMapper } from '../interface/gallery-response-mapper.interface';
import { Gallery } from '../entities/gallery.entity';
import { map, Observable } from 'rxjs';
import { IGalleryResponse } from '../interface/gallery-reponse.interface';

@Injectable()
export class GalleryInterceptor
  extends GalleryResponseMapper
  implements NestInterceptor<Gallery, IGalleryResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Gallery>,
  ): Observable<IGalleryResponse> | Promise<Observable<IGalleryResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}