import { CreateContactUsDto } from 'src/modules/contact-us/dto/create-contact-us.dto';
import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';

export class ContactAdminNotificationMail extends Mailable {
    constructor(
        private readonly adminEmail: string,
        private readonly contact: CreateContactUsDto,
    ) {
        super();
    }

    public envelope(): Envelope {
        return new Envelope({
            to: this.adminEmail,
            subject: 'New Contact Enquiry — Greatway Properties',
        });
    }

    public content(): Content {
        return new Content({
            text: `You have received a new contact enquiry.

Visitor Details:
Name: ${this.contact.fullName}
Email: ${this.contact.email}
${this.contact.phoneNumber ? `Phone: ${this.contact.phoneNumber}` : ''}

Message:
${this.contact.message}`,
        });
    }

    public attachments(): Attachment[] {
        return [];
    }

    public headers(): Header[] {
        return [];
    }
}