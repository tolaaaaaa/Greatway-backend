import { Notification } from "../interface/notification.interface";

export class NewApplicationNotification extends Notification {
  constructor(
    private readonly applicantName: string,
    private readonly applicantEmail: string,
    private readonly jobTitle: string,
    private readonly companyName: string,
  ) {
    super();
  }

  public via(): string[] {
    return ['database'];
  }

  public toDatabase(): Record<string, unknown> {
    return {
      message: `New application from ${this.applicantName} for the ${this.jobTitle} role at ${this.companyName}.`,
      applicantName: this.applicantName,
      applicantEmail: this.applicantEmail,
      jobTitle: this.jobTitle,
      companyName: this.companyName,
    };
  }
}