import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { Request } from "express"
import { Observable } from "rxjs"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"
import { User } from "src/modules/users/entities/user.entity"

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
  ) {
    super()
  }

  canActivate(context: ExecutionContext): Promise<boolean> | boolean | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])

    // Allow client if it is a public route
    if (isPublic) return true

    // Default JWT authentication for all other routes
    return super.canActivate(context)
  }

  handleRequest<T extends User>(err: any, user: T, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || "Unauthorized")
    }
    return user
  }
}