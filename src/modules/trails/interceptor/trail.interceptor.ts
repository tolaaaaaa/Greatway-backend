import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { TrailResponseMapper } from '../interface/trail-response-mapper.interface';
import { Trail } from '../entities/trail.entity';
import { ITrailResponse } from '../interface/trail-response.interface';
import { map, Observable } from 'rxjs';

@Injectable()
export class TrailInterceptor
  extends TrailResponseMapper
  implements NestInterceptor<Trail, ITrailResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Trail>,
  ): Observable<ITrailResponse> | Promise<Observable<ITrailResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}