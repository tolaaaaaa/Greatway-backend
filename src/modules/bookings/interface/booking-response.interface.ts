import { BOOKING_STATUS } from "../enum/booking-status.enun";

export interface IBookingResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  declineReason?: string
  status: BOOKING_STATUS
  location: string;
  inspectionDate: Date;
  inspectionTime: string;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}