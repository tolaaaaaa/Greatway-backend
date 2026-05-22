import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserResponseMapper } from '../interface/user.response.mapper';
import { IUsersResponse } from '../interface/users.response.interface';
import { PaginationParams, PaginationService } from 'src/services/pagination';
import { map, Observable } from 'rxjs';
import { IUserResponse } from '../interface/user.response.interface';

type Payload = [User[], number];

@Injectable()
export class UsersInterceptor
  extends UserResponseMapper
  implements NestInterceptor<Payload, IUsersResponse>
{
  constructor(private paginationService: PaginationService) {
    super();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Payload>,
  ): Observable<IUsersResponse> | Promise<Observable<IUsersResponse>> {
    const request = context.switchToHttp().getRequest();
    const { page, limit } = request.query;

    return next
      .handle()
      .pipe(map((data) => this.paginate(data, { page, limit })));
  }

  paginate([users, total]: Payload, params: PaginationParams): IUsersResponse {
    const data = users.map((user) => this.transform(user));
    return this.paginationService.paginate<IUserResponse>(data, total, params);
  }
}
