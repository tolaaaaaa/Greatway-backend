import { registerAs } from "@nestjs/config"

export default registerAs(
  "auth",
  (): IAuth => ({
    jwtSecret: process.env.JWT_SECRET as string,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET as string,
    resetSecret: process.env.RESET_TOKEN_SECRET as string,
    shortTimeJwtSecret: process.env.SHORT_TIME_SECRET as string,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL as string
    }
  })
)

export interface IAuth {
  jwtSecret: string
  resetSecret: string
  refreshSecret: string
  shortTimeJwtSecret: string
  google: {
    clientId: string
    clientSecret: string
    callbackUrl: string
  }
}
