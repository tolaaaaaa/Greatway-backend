import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Application } from '../entities/application.entity';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable } from 'rxjs';
import { IApplicationResponse } from '../interface/application-response.inteface';
import { IApplicationsResponse } from '../interface/applications-response.inteface';
import { ApplicationResponseMapper } from '../interface/application-mapper.interface';

type Payload = [Application[], number];

@Injectable()
export class ApplicationsInterceptor
  extends ApplicationResponseMapper
  implements NestInterceptor<Payload, IApplicationsResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<IApplicationsResponse> | Promise<Observable<IApplicationsResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate(
    [applications, total]: Payload,
    params: PaginationParams,
  ): IApplicationsResponse {
    const data = applications.map((application) => this.transform(application));
    return this.paginationService.paginate<IApplicationResponse>(
      data,
      total,
      params,
    );
  }
}