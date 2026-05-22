import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable, map } from "rxjs"
import { AuthUser, IAuthResponse } from "../interface/auth-response"
import { AuthResponseMapper } from "../interface/auth-response-mapper"

@Injectable()
export class AuthInterceptor extends AuthResponseMapper implements NestInterceptor<AuthUser, IAuthResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<AuthUser>): Observable<IAuthResponse> {
    return next.handle().pipe(
      map((data) => {
        return this.transform(data)
      })
    )
  }
}
