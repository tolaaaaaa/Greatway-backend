import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Career } from '../entities/career.entity';
import { CareerResponseMapper } from '../interface/career-response-mapper.interface';
import { ICareersResponse } from '../interface/careers-response.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable } from 'rxjs';
import { ICareerResponse } from '../interface/career-response.interface';

type Payload = [Career[], number];

@Injectable()
export class CareersInterceptor
  extends CareerResponseMapper
  implements NestInterceptor<Payload, ICareersResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<ICareersResponse> | Promise<Observable<ICareersResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate(
    [careers, total]: Payload,
    params: PaginationParams,
  ): ICareersResponse {
    const data = careers.map((career) => this.transform(career));
    return this.paginationService.paginate<ICareerResponse>(
      data,
      total,
      params,
    );
  }
}