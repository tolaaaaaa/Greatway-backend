import {
  Attachment,
  Content,
  Envelope,
  Header,
  Mailable,
} from 'src/services/mail';

export class AdminRegisteredNotification extends Mailable {
  constructor(
    private readonly superAdminEmail: string,
    private readonly adminName: string,
    private readonly adminEmail: string,
  ) {
    super();
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.superAdminEmail,
      subject: 'New Admin Registration — Action Required',
    });
  }

  public content(): Content {
    return new Content({
      text: `A new admin account has been registered and is pending activation.

Name: ${this.adminName}
Email: ${this.adminEmail}

Please review and activate or reject this account at your earliest convenience.`,
    });
  }

  public attachments(): Attachment[] {
    return [];
  }

  public headers(): Header[] {
    return [];
  }
}
