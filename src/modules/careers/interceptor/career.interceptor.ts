import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CareerResponseMapper } from '../interface/career-response-mapper.interface';
import { Career } from '../entities/career.entity';
import { ICareerResponse } from '../interface/career-response.interface';
import { map, Observable } from 'rxjs';

@Injectable()
export class CareerInterceptor
  extends CareerResponseMapper
  implements NestInterceptor<Career, ICareerResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Career>,
  ): Observable<ICareerResponse> | Promise<Observable<ICareerResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}