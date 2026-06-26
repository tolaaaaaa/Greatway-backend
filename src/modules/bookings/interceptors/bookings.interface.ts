import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Booking } from '../entities/booking.entity';
import { IBookingsResponse } from '../interface/bookings-response.interface';
import { IBookingResponse } from '../interface/booking-response.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { BookingResponseMapper } from '../interface/booking--response-mapper.inteface';

type Payload = [Booking[], number];

@Injectable()
export class BookingsInterceptor
  extends BookingResponseMapper
  implements NestInterceptor<Payload, IBookingsResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<IBookingsResponse> | Promise<Observable<IBookingsResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate([bookings, total]: Payload, params: PaginationParams): IBookingsResponse {
    const data = bookings.map((booking) => this.transform(booking));
    return this.paginationService.paginate<IBookingResponse>(data, total, params);
  }
}