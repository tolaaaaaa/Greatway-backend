import { Career } from '../entities/career.entity';
import { ICareerResponse } from './career-response.interface';

export abstract class CareerResponseMapper implements IInterceptor {
  transform(career: Career): ICareerResponse {
    return {
      id: career.id,
      title: career.title,
      description: career.description,
      employmentType: career.employmentType,
      location: career.location,
      status: career.status,
      companyName: career.companyName,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt,
    };
  }
}