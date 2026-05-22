import { User } from "../entities/user.entity";
import { IUserResponse } from "./user.response.interface";

export abstract class UserResponseMapper implements IInterceptor {
    transform(data: User): IUserResponse {
        return {
            id: data.id,
            fullName: data.fullName,
            role: data.role,
            email: data.email,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        }
    }
}