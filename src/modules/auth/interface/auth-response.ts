import { User } from "src/modules/users/entities/user.entity"


export interface IAuthResponse {
  user: {
    id: string
    email: string
    role: string
    fullName: string
    createdAt: Date
    updatedAt: Date
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface AuthUser {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
