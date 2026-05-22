import { Request } from "express"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { loginSchema } from "../dto/auth.dto"
import { JoiException } from "src/exceptions/joi.exception"

@Injectable()
export class LoginValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest()

    const { error } = loginSchema.validate(req.body)

    if (error) {
      throw new JoiException(error.message.replace(/\"/g, ""))
    }

    return true
  }
}
