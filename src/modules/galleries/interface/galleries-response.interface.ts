import { PaginatedResult } from 'src/services/pagination';
import { IGalleryResponse } from './gallery-reponse.interface';

export type IGallerysResponse = PaginatedResult<IGalleryResponse>;