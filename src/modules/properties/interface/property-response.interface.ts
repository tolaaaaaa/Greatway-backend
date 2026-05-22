import { UserStatus } from "src/modules/users/interface/user.status.interface";
import { PropertyStatus } from "./property-status.interface";

export interface IPropertyResponse {
  id: string;
  title: string;
  salesPrice: string;
  location: string;
  description: string;
  saleSupportAvatar: string;
  imageUrls: string[];
  features: IPropertyFeatureResponse[];
  videoUrl: string;
  supportInCharge: string;
  whatsAppNumber: string;
  altNumber: string;
  status: PropertyStatus
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyFeatureResponse {
  id: string;
  description: string;
  icon: string | null;
}