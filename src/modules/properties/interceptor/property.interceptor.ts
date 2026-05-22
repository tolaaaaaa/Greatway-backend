import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PropertyResponseMapper } from '../interface/property-response-mapper.interface';
import { Property } from '../entities/property.entity';
import { IPropertyResponse } from '../interface/property-response.interface';
import { map, Observable } from 'rxjs';

@Injectable()
export class PropertyInterceptor
  extends PropertyResponseMapper
  implements NestInterceptor<Property, IPropertyResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Property>,
  ): Observable<IPropertyResponse> | Promise<Observable<IPropertyResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}