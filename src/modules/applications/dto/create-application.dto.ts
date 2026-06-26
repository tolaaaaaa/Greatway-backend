import * as joi from "joi"


export class CreateApplicationDto {
    fullName!: string
    email!: string
    jobId!: string
    phoneNumber!: string
    resume!: string
    coverLetter?: string
    startDate!: Date
}

export const createApplicationSchema = joi.object({
    fullName: joi.string().trim().min(2).max(100).required(),
    email: joi.string().email().trim().lowercase().required(),
    phoneNumber: joi.string().trim().min(7).max(20).required(),
    startDate: joi.date().iso().greater("now").required(),
    jobId: joi.string().uuid().required()
});