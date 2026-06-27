import * as joi from "joi";
import { BOOKING_STATUS } from "../enum/booking-status.enun";

export class CreateBookingDto {
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  email!: string;
  location!: string;
  inspectionDate!: Date;
  status?: BOOKING_STATUS;
  declineReason?: string;
  inspectionTime!: string
  message?: string;
}

export const createBookingSchema = joi.object({
  firstName: joi.string().trim().min(2).max(50).required(),
  lastName: joi.string().trim().min(2).max(50).required(),
  phoneNumber: joi.string().required(),
  email: joi.string().email().trim().lowercase().required(),
  location: joi.string().trim().min(2).max(200).required(),
  inspectionDate: joi.date().iso().greater("now").required(),
  inspectionTime: joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  message: joi.string().trim().max(1000).optional(),
});