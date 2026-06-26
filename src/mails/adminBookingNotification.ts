import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';
import { Booking } from 'src/modules/bookings/entities/booking.entity';

export class BookingAdminNotificationMail extends Mailable {
  constructor(
    private readonly adminEmail: string,
    private readonly booking: Booking,
  ) {
    super();
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.adminEmail,
      subject: 'New Inspection Booking — Action Required',
    });
  }

  public content(): Content {
    return new Content({
      text: `A new inspection booking has been submitted.

Visitor Details:
Name: ${this.booking.firstName} ${this.booking.lastName}
Email: ${this.booking.email}
Phone: ${this.booking.phoneNumber}

Booking Details:
Location: ${this.booking.location}
Inspection Date: ${new Date(this.booking.inspectionDate).toDateString()}
Inspection Time: ${this.booking.inspectionTime}
${this.booking.message ? `Message: ${this.booking.message}` : ''}

Please log in to the admin dashboard to confirm or decline this booking.`,
    });
  }

  public attachments(): Attachment[] {
    return [];
  }

  public headers(): Header[] {
    return [];
  }
}