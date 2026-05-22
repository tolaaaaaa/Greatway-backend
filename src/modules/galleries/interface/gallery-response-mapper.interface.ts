import { Gallery } from '../entities/gallery.entity';
import { IGalleryResponse } from './gallery-reponse.interface';

export abstract class GalleryResponseMapper implements IInterceptor {
  transform(gallery: Gallery): IGalleryResponse {
    return {
      id: gallery.id,
      imageUrl: gallery.imageUrl,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
    };
  }
}