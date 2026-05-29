
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Notification } from '../interface/notification.interface';

export const NOTIFICATION_QUEUE = 'notifications';

@Injectable()
export class NotificationQueueProducer {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async dispatch(
    notifiable: { id: string },
    notification: Notification,
  ): Promise<void> {
    await this.queue.add('send', {
      notifiableId: notifiable.id,
      type: notification.constructor.name,
      data: notification.toDatabase(),
    });
  }
}