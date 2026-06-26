import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Booking } from '../entities/booking.entity';
import { IBookingResponse } from '../interface/booking-response.interface';
import { BookingResponseMapper } from '../interface/booking--response-mapper.inteface';

@Injectable()
export class BookingInterceptor
  extends BookingResponseMapper
  implements NestInterceptor<Booking, IBookingResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Booking>,
  ): Observable<IBookingResponse> | Promise<Observable<IBookingResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}