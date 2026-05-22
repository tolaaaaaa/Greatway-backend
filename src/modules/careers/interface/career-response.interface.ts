import type { CareerStatus } from './career.status.interface';
import type { EmploymentType } from './career.employment-type.interface';

export interface ICareerResponse {
  id: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  location: string;
  status: CareerStatus;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
}