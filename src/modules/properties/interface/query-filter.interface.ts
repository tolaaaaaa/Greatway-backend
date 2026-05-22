import { PaginationParams } from "src/services/pagination"
import { Property } from "../entities/property.entity"
import { FindOptionsWhere } from "typeorm"

export interface IPropertiesQuery extends PaginationParams, FindOptionsWhere<Property> {
    location?: string
    page?: number
    limit?: number
    status?: "listed" | "unlisted" | "sold"
}