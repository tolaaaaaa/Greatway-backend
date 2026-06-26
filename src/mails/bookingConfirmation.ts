import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';
import { Booking } from 'src/modules/bookings/entities/booking.entity';

export class BookingConfirmationMail extends Mailable {
  constructor(private readonly booking: Booking) {
    super();
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.booking.email,
      subject: 'Inspection Booking Received — Greatway Properties',
    });
  }

  public content(): Content {
    return new Content({
      text: `Hi ${this.booking.firstName},

Thank you for booking an inspection with Greatway Properties. We have received your request and will confirm it shortly.

Booking Details:
Location: ${this.booking.location}
Inspection Date: ${new Date(this.booking.inspectionDate).toDateString()}
Inspection Time: ${this.booking.inspectionTime}
${this.booking.message ? `Message: ${this.booking.message}` : ''}

We will reach out to you at ${this.booking.email} or ${this.booking.phoneNumber} to confirm your booking.

Best regards,
Greatway Properties Team`,
    });
  }

  public attachments(): Attachment[] {
    return [];
  }

  public headers(): Header[] {
    return [];
  }
}