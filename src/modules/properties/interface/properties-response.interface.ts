import { PaginatedResult } from 'src/services/pagination';
import { IPropertyResponse } from './property-response.interface';

export type IPropertysResponse = PaginatedResult<IPropertyResponse>;