import {
    Attachment,
    Content,
    Envelope,
    Header,
    Mailable,
} from 'src/services/mail';

export class ResendOtpMail extends Mailable {
    constructor(
        private readonly userEmail: string,
        private readonly username: string,
        private readonly code: string,
    ) {
        super();
    }

    public envelope(): Envelope {
        return new Envelope({
            to: this.userEmail,
            subject: 'Your New Verification Code',
        });
    }

    public content(): Content {
        return new Content({
            text: `Hi ${this.username},

You requested a new verification code. Please use the code below to verify your email address:

${this.code}

This code will expire shortly. If you did not request this, please ignore this email.

Thank you,
The Platform Team`,
        });
    }

    public attachments(): Attachment[] {
        return [];
    }

    public headers(): Header[] {
        return [];
    }
}