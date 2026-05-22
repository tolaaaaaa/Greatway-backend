import { PartialType } from '@nestjs/swagger';
import { CreateGalleryDto } from './create-gallery.dto';
import * as joi from 'joi';

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}



export const updateGallerySchema = joi.object({
  imageUrl: joi.string().uri().optional(),
});