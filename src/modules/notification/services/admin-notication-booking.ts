import { BOOKING_STATUS } from "src/modules/bookings/enum/booking-status.enun";
import { Notification } from "../interface/notification.interface";

export class NewBookingNotification extends Notification {
  constructor(
    private readonly visitorName: string,
    private readonly visitorEmail: string,
    private readonly location: string,
    private readonly inspectionDate: Date,
  ) {
    super();
  }

  public via(): string[] {
    return ['database'];
  }

  public toDatabase(): Record<string, unknown> {
    return {
      message: `New inspection booking from ${this.visitorName} for ${this.location} on ${new Date(this.inspectionDate).toDateString()}.`,
      visitorName: this.visitorName,
      visitorEmail: this.visitorEmail,
      location: this.location,
      inspectionDate: this.inspectionDate,
    };
  }
}

export class BookingStatusNotification extends Notification {
  constructor(
    private readonly firstName: string,
    private readonly status: BOOKING_STATUS.CONFIRMED | BOOKING_STATUS.DECLINED,
    private readonly location: string,
    private readonly declineReason?: string,
  ) {
    super();
  }

  public via(): string[] {
    return ['database'];
  }

  public toDatabase(): Record<string, unknown> {
    return {
      message: this.status === BOOKING_STATUS.CONFIRMED
        ? `Your inspection booking for ${this.location} has been confirmed.`
        : `Your inspection booking for ${this.location} has been declined.${this.declineReason ? ` Reason: ${this.declineReason}` : ''}`,
      firstName: this.firstName,
      status: this.status,
      location: this.location,
      ...(this.declineReason && { declineReason: this.declineReason }),
    };
  }
}