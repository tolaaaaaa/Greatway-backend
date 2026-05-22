import { PaginationParams } from 'src/services/pagination';
import type { UserStatus } from './user.status.interface';
import { UserRole } from './user.role.inteface';

export interface IUsersQuery extends PaginationParams {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
}