import { PaginatedResult } from 'src/services/pagination';
import { ICareerResponse } from './career-response.interface';

export type ICareersResponse = PaginatedResult<ICareerResponse>;