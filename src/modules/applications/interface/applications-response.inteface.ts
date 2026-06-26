import { PaginatedResult } from "src/services/pagination";
import { IApplicationResponse } from "./application-response.inteface";

export type IApplicationsResponse = PaginatedResult<IApplicationResponse>