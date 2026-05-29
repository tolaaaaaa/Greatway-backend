import { SetMetadata } from "@nestjs/common"
import type { UserRole } from "src/modules/users/interface/user.role.inteface"

export const ROLES_KEY = "roles"
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
