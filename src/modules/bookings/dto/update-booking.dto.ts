import { BOOKING_STATUS } from "../enum/booking-status.enun";
import { createBookingSchema } from "./create-booking.dto";
import * as joi from "joi"

export class UpdateBookingDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  inspectionDate?: Date;
  inspectionTime?: string;
  message?: string;
}
export const updateBookingSchema = createBookingSchema.fork(
  ['firstName', 'lastName', 'email', 'location', 'inspectionDate', 'inspectionTime', 'message'],
  (field) => field.optional()
).append({
  status: joi.string()
    .valid(...Object.values(BOOKING_STATUS))
    .optional(),
  declineReason: joi.when("status", {
    is: BOOKING_STATUS.DECLINED,
    then: joi.string().trim().max(500).optional(),
    otherwise: joi.forbidden(),
  }),
});