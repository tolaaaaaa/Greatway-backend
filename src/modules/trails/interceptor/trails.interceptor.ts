import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Trail } from '../entities/trail.entity';
import { TrailResponseMapper } from '../interface/trail-response-mapper.interface';
import { ITrailsResponse } from '../interface/trails-response.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable, tap } from 'rxjs';
import { ITrailResponse } from '../interface/trail-response.interface';

type Payload = [Trail[], number];

@Injectable()
export class TrailsInterceptor
  extends TrailResponseMapper
  implements NestInterceptor<Payload, ITrailsResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<ITrailsResponse> | Promise<Observable<ITrailsResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next.handle().pipe(
      map((data) => this.paginate(data, { page, limit })),
    );
  }

  paginate(
    [trails, total]: Payload,
    params: PaginationParams,
  ): ITrailsResponse {
    const data = trails.map((trail) => this.transform(trail));
    return this.paginationService.paginate<ITrailResponse>(data, total, params);
  }
}
