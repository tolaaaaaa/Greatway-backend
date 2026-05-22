import { AuthUser, IAuthResponse } from "./auth-response"

export abstract class AuthResponseMapper implements IInterceptor {
  transform(data: AuthUser): IAuthResponse {
    return {
      user: {
        id: data.user.id,
        role: data.user.role,
        email: data.user.email, 
        fullName: data.user.fullName,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      },
      tokens: {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken
      }
    }
  }
}
