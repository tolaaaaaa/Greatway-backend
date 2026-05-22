import { PaginatedResult } from 'src/services/pagination';
import { ITrailResponse } from './trail-response.interface';

export type ITrailsResponse = PaginatedResult<ITrailResponse>;