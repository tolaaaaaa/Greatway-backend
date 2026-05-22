import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UserResponseMapper } from '../interface/user.response.mapper';
import { User } from '../entities/user.entity';
import { IUserResponse } from '../interface/user.response.interface';
import { map, Observable } from 'rxjs';

@Injectable()
export class UserInterceptor
  extends UserResponseMapper
  implements NestInterceptor<User, IUserResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<IUserResponse> | Promise<Observable<IUserResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }
}
