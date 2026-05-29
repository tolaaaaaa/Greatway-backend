export abstract class Notification {
  public abstract via(): string[];
  public abstract toDatabase(): Record<string, unknown>;
}

export interface DatabaseNotificationPayload {
  type: string;
  data: Record<string, unknown>;
  readAt?: Date | null;
  createdAt?: Date;
}