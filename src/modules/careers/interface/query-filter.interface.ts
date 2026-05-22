import { Career } from "../entities/career.entity"
import { FindOptionsWhere } from "typeorm"
import { CareerStatus } from "./career.status.interface"
import { EmploymentType } from "./career.employment-type.interface"
import { PaginationParams } from "src/services/pagination"

export interface ICareersQuery extends PaginationParams, FindOptionsWhere<Career> {
    status?: CareerStatus
    employmentType?: EmploymentType
    location?: string
}