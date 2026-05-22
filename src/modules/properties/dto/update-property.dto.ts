import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import * as joi from 'joi';
import { PROPERTY_STATUS } from '../enum/property-status.enum';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export const updatePropertySchema = joi.object({
  title: joi.string().optional(),
  salesPrice: joi.string().optional(),
  location: joi.string().optional(),
  status: joi.string().valid(...PROPERTY_STATUS).optional(),
  description: joi.string().optional(),
  videoUrl: joi.string().optional(),
  saleSupportAvatar: joi.string().optional(),
  supportInCharge: joi.string().optional(),
  whatsAppNumber: joi.string().optional(),
  altNumber: joi.string().optional(),
  imageUrls: joi.array().items(joi.string()).optional(),
  features: joi
    .array()
    .items(
      joi.object({
        id: joi.string().optional(),
        description: joi.string().optional(),
        icon: joi.string().optional().allow(null, ''),
      }),
    )
    .optional(),
});
