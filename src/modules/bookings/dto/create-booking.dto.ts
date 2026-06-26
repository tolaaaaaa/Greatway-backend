import * as joi from "joi";

export class CreateBookingDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  location!: string;
  inspectionDate!: Date;
  inspectionTime!: Date;
  message?: string;
}

export const createBookingSchema = joi.object({
  firstName: joi.string().trim().min(2).max(50).required(),
  lastName: joi.string().trim().min(2).max(50).required(),
  email: joi.string().email().trim().lowercase().required(),
  location: joi.string().trim().min(2).max(200).required(),
  inspectionDate: joi.date().iso().greater("now").required(),
  inspectionTime: joi.date().iso().required(),
  message: joi.string().trim().max(1000).optional(),
});