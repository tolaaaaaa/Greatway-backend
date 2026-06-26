import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Application } from '../entities/application.entity';
import { IApplicationResponse } from '../interface/application-response.inteface';
import { map, Observable } from 'rxjs';
import { ApplicationResponseMapper } from '../interface/application-mapper.interface';

@Injectable()
export class ApplicationInterceptor
  extends ApplicationResponseMapper
  implements NestInterceptor<Application, IApplicationResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Application>,
  ): Observable<IApplicationResponse> | Promise<Observable<IApplicationResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}