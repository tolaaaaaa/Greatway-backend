import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';
import { Application } from 'src/modules/applications/entities/application.entity';

export class ApplicationConfirmationMail extends Mailable {
  constructor(private readonly application: Application, private jobTitle: string, private JobCompanyName: string) {
    super();
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.application.email,
      subject: 'Application Received — Greatway Properties',
    });
  }

  public content(): Content {
    return new Content({
      text: `Hi ${this.application.fullName},

Thank you for applying for the ${this.jobTitle} position at ${this.JobCompanyName}.

We have received your application and will review it shortly. If your profile matches what we are looking for, we will be in touch.

Application Details:
Role: ${this.jobTitle}
Company: ${this.JobCompanyName}

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