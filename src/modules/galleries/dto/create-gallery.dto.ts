import * as joi from 'joi';

export class CreateGalleryDto {
  imageUrl!: string;
}

export const createGallerySchema = joi.object({
  imageUrl: joi.string().uri().optional(),
});