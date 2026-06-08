import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import * as joi from "joi"
import { USER_ROLE } from '../enum/user-role';
import { USER_STATUS } from '../enum/user-status';

export class UpdateUserDto extends PartialType(CreateUserDto) {}


export const updateUserSchema = joi.object({
    fullName: joi.string().optional(),
    email: joi.string().email().lowercase().optional(),
    password: joi.string().min(6).optional(),
    status: joi.string().valid(...USER_STATUS).optional(),
    role: joi.string().valid(...USER_ROLE).optional()
})