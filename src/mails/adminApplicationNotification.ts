import { Attachment, Content, Envelope, Header, Mailable } from 'src/services/mail';
import { Application } from 'src/modules/applications/entities/application.entity';

export class AdminApplicationNotificationMail extends Mailable {
  constructor(
    private readonly adminEmail: string,
    private readonly application: Application,
    private readonly jobTitle: string,
    private readonly JobCompanyName: string
  ) {
    super();
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.adminEmail,
      subject: `New Job Application — ${this.jobTitle}`,
    });
  }

  public content(): Content {
    return new Content({
      text: `A new application has been submitted for the ${this.jobTitle} role.

Applicant Details:
Name: ${this.application.fullName}
Email: ${this.application.email}
Phone: ${this.application.phoneNumber}
Start Date: ${new Date(this.application.startDate).toDateString()}

Role: ${this.jobTitle}
Company: ${this.JobCompanyName}

Resume: ${this.application.resume}
${this.application.coverLetter ? `Cover Letter: ${this.application.coverLetter}` : ''}

Please log in to the admin dashboard to review this application.`,
    });
  }

  public attachments(): Attachment[] {
    return [];
  }

  public headers(): Header[] {
    return [];
  }
}