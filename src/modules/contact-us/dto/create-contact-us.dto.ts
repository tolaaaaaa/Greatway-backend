import * as joi from "joi"

export class CreateContactUsDto {
    fullName!: string;
    email!: string;
    phoneNumber?: string;
    message!: string;
}


export const createContactUsSchema = joi.object({
  fullName: joi.string().trim().min(2).max(100).required(),
  email: joi.string().email().trim().lowercase().required(),
  phoneNumber: joi.string().trim().optional(),
  message: joi.string().trim().min(1).max(2000).required(),
});