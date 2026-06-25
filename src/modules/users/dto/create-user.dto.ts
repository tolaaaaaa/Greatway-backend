import * as joi from "joi"
import { USER_ROLE } from "../enum/user-role"
import { UserStatus } from "../interface/user.status.interface"
import { USER_STATUS } from "../enum/user-status"

export class CreateUserDto {
    fullName?: string
    phoneNumber?: string
    email!: string
    isEmailVerified?: boolean
    status?: UserStatus
    password!: string
    createdAt?: Date
    updatedAt?: Date
}


export const createUserSchema = joi.object({
    fullName: joi.string().optional(),
    email: joi.string().email().lowercase().required(),
    password: joi.string().required(),
    status: joi.string().valid(...USER_STATUS).optional(),
    role: joi.string().valid(...USER_ROLE).optional()
})