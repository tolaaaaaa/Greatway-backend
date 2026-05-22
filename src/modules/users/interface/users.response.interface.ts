import { PaginatedResult } from "src/services/pagination";
import { IUserResponse } from "./user.response.interface";

export type IUsersResponse = PaginatedResult<IUserResponse>