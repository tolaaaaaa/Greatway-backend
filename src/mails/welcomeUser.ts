import {
    Attachment,
    Content,
    Envelope,
    Header,
    Mailable,
} from 'src/services/mail';

export class WelcomeUser extends Mailable {
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
            subject: 'Welcome to Our Platform',
        });
    }

    public content(): Content {
        return new Content({
            text: `Welcome, ${this.username}! Your account has been created successfully.

Please use the following code to verify your email address:

${this.code}

Thank you for joining our platform!`,
        });
    }



    public attachments(): Attachment[] {
        return [];
    }

    public headers(): Header[] {
        return [];
    }
}
