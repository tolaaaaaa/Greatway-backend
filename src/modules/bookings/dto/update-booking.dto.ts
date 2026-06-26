import { createBookingSchema } from "./create-booking.dto";

export class UpdateBookingDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  inspectionDate?: Date;
  inspectionTime?: Date;
  message?: string;
}

export const updateBookingSchema = createBookingSchema.fork(
  ['firstName', 'lastName', 'email', 'location', 'inspectionDate', 'inspectionTime'],
  (field) => field.optional()
);