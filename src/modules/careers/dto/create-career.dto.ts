import * as joi from "joi"
import { CareerStatus } from "../interface/career.status.interface"
import { EmploymentType } from "../interface/career.employment-type.interface"

export class CreateCareerDto {
    title!: string
    companyName!: string
    location!: string
    employmentType!: EmploymentType
    description!: string
    status!: CareerStatus
}


export const createCareerSchema = joi.object({
    title: joi.string().required(),
    companyName: joi.string().required(),
    location: joi.string().required(),
    employmentType: joi.string().valid("full-time", "contract", "part-time", "internship").required(),
    description: joi.string().required()
})
