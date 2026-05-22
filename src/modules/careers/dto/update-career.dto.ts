import { PartialType } from '@nestjs/swagger';
import { CreateCareerDto } from './create-career.dto';
import * as joi from 'joi';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {}


export const updateCareerSchema = joi.object({
    title: joi.string().optional(),
    companyName: joi.string().optional(),
    location: joi.string().optional(),
    employmentType: joi.string().valid("full-time", "contract", "part-time", "internship").optional(),
    description: joi.string().optional(),
    status: joi.string().optional()
})
