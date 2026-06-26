export interface IBookingResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  inspectionDate: Date;
  inspectionTime: Date;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}