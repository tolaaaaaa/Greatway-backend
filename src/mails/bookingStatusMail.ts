import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { BOOKING_STATUS } from 'src/modules/bookings/enum/booking-status.enun';

export class BookingStatusMail extends Mailable {
    constructor(private readonly booking: Booking) {
        super();
    }

    public envelope(): Envelope {
        const subject = this.booking.status === BOOKING_STATUS.CONFIRMED
            ? 'Your Inspection Has Been Confirmed — Greatway Properties'
            : 'Update on Your Inspection Booking — Greatway Properties';

        return new Envelope({
            to: this.booking.email,
            subject,
        });
    }

    public content(): Content {
        const body = this.booking.status === BOOKING_STATUS.CONFIRMED
            ? `Hi ${this.booking.firstName},

Great news! Your inspection booking has been confirmed.

Booking Details:
Location: ${this.booking.location}
Inspection Date: ${new Date(this.booking.inspectionDate).toDateString()}
Inspection Time: ${this.booking.inspectionTime}

    Please ensure you arrive on time. If you need to reschedule, feel free to reach out to us.

Best regards,
Greatway Properties Team`
            : `Hi ${this.booking.firstName},

Unfortunately, we are unable to accommodate your inspection booking at this time.

${this.booking.declineReason ? `Reason: ${this.booking.declineReason}\n` : ''}
Please feel free to submit a new booking request for a different date or time.

Best regards,
Greatway Properties Team`;

        return new Content({ text: body });
    }

    public attachments(): Attachment[] {
        return [];
    }

    public headers(): Header[] {
        return [];
    }
}