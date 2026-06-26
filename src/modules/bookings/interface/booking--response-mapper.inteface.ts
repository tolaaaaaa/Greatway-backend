import { Booking } from "../entities/booking.entity";
import { IBookingResponse } from "./booking-response.interface";

export abstract class BookingResponseMapper implements IInterceptor {
  transform(data: Booking): IBookingResponse {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      location: data.location,
      inspectionDate: data.inspectionDate,
      inspectionTime: data.inspectionTime,
      message: data.message ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}