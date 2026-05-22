import { UserStatus } from "./user.status.interface"

export interface IUserResponse {
    id: string
    fullName: string
    email: string
    role: string
    status: UserStatus
    createdAt: Date
    updatedAt: Date
}