import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"
import { UsersService } from "src/modules/users/users.service"
import { IAuth } from "src/config/auth.config"
import { UnAuthorizedException } from "src/exceptions/unAuthorized.exception"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<IAuth>("auth")?.jwtSecret
    })
  }

  async validate(payload: any, req: Request & {user: Express.User}) {
    const user = await this.userService.findById(payload.id)

    if (!user) {
      throw new UnAuthorizedException()
    }

    req.user = user
    return user
  }
}
