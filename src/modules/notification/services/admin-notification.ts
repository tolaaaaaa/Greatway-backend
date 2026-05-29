import { Notification } from "../interface/notification.interface";


export class AdminNotification extends Notification {
  constructor(
    private readonly adminName: string,
    private readonly adminEmail: string,
  ) {
    super();
  }

  public via(): string[] {
    return ['database'];
  }

  public toDatabase(): Record<string, unknown> {
    return {
      message: `New admin ${this.adminName} has registered and is pending activation.`,
      adminName: this.adminName,
      adminEmail: this.adminEmail,
    };
  }
}