import { PaginatedResult } from "src/services/pagination";
import { IBookingResponse } from "./booking-response.interface";

export type IBookingsResponse = PaginatedResult<IBookingResponse>;