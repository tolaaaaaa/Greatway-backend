import { Property } from '../entities/property.entity';
import { IPropertyResponse } from './property-response.interface';

export abstract class PropertyResponseMapper implements IInterceptor {
  transform(property: Property): IPropertyResponse {
    return {
      id: property.id,
      title: property.title,
      salesPrice: property.salesPrice,
      location: property.location,
      description: property.description,
      status: property.status,
      imageUrls: property.imageUrls,
      saleSupportAvatar: property.saleSupportAvatar,
      features: property.features?.map((feature) => ({
        id: feature.id,
        description: feature.description,
        icon: feature.icon,
      })) || [],
      videoUrl: property.videoUrl,
      supportInCharge: property.supportInCharge,
      whatsAppNumber: property.whatsAppNumber,
      altNumber: property.altNumber,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}