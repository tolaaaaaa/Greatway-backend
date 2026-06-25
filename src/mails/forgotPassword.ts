import {
    Attachment,
    Content,
    Envelope,
    Header,
    Mailable,
} from 'src/services/mail';

export class ForgotPasswordMail extends Mailable {
    constructor(
        private readonly userEmail: string,
        private readonly username: string,
        private readonly resetUrl: string,
    ) {
        super();
    }

    public envelope(): Envelope {
        return new Envelope({
            to: this.userEmail,
            subject: 'Reset Your Password',
        });
    }

    public content(): Content {
        return new Content({
            text: `Hi ${this.username},

We received a request to reset your password.

Click the link below to reset your password (expires in 30 minutes):

${this.resetUrl}

If you did not request a password reset, please ignore this email. Your account remains secure.

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