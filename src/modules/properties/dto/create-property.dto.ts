import * as joi from "joi"
import { PropertyStatus } from "../interface/property-status.interface"

export class CreatePropertyDto {
    title!: string
    salesPrice!: string
    location!: string
    description!: string
    videoUrl!: string
    status?: PropertyStatus
    supportInCharge!: string
    saleSupportAvatar!: string
    whatsAppNumber!: string
    altNumber!: string
    imageUrls!: string[]
    features!: { id?: string, description: string; icon?: string }[]
}

export const createPropertySchema = joi.object({
    title: joi.string().required(),
    salesPrice: joi.string().required(),
    location: joi.string().required(),
    description: joi.string().required(),
    videoUrl: joi.string().optional().default(""),
    saleSupportAvatar: joi.string().optional(),
    supportInCharge: joi.string().required(),
    whatsAppNumber: joi.string().required(),
    altNumber: joi.string().required(),
    imageUrls: joi.array().items(joi.string()).optional().default([]),
    features: joi.array().items(
        joi.object({
            description: joi.string().required(),
            icon: joi.string().optional().allow(null, "")
        })
    ).optional().default([])
})