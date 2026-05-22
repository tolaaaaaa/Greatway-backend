import { Trail } from '../entities/trail.entity';
import { ITrailResponse } from './trail-response.interface';

export abstract class TrailResponseMapper implements IInterceptor {
  transform(trail: Trail): ITrailResponse {
    return {
      id: trail.id,
      description: trail.description,
      createdAt: trail.createdAt,
      updatedAt: trail.updatedAt,
    };
  }
}