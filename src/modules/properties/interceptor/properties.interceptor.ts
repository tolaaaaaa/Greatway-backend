import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { PropertyResponseMapper } from '../interface/property-response-mapper.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable } from 'rxjs';
import { IPropertyResponse } from '../interface/property-response.interface';
import { IPropertysResponse } from '../interface/properties-response.interface';

type Payload = [Property[], number];

@Injectable()
export class PropertiessInterceptor
  extends PropertyResponseMapper
  implements NestInterceptor<Payload, IPropertysResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<IPropertysResponse> | Promise<Observable<IPropertysResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate(
    [properties, total]: Payload,
    params: PaginationParams,
  ): IPropertysResponse {
    const data = properties.map((property) => this.transform(property));
    return this.paginationService.paginate<IPropertyResponse>(
      data,
      total,
      params,
    );
  }
}