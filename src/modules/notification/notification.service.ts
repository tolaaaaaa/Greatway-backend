import { Injectable } from '@nestjs/common';
import { DatabaseChannel } from './channels/database.channel';
import { NotificationQueueProducer } from './queue/notification.queue-producer';
import { Notification } from './interface/notification.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    private readonly databaseChannel: DatabaseChannel,
    private readonly notificationQueue: NotificationQueueProducer,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async send(
    notifiable: { id: string },
    notification: Notification,
  ): Promise<void> {
    const channels = notification.via();

    await Promise.all(
      channels.map((channel) => {
        if (channel === 'database') {
          return this.databaseChannel.send(notifiable, notification);
        }
        console.warn(`Unsupported channel: ${channel}`);
      }),
    );
  }

  async queue(
    notifiable: { id: string },
    notification: Notification,
  ): Promise<void> {
    await this.notificationQueue.dispatch(notifiable, notification);
  }

  async findAll(notifiableId: string) {
    return this.notificationRepo.find({
      where: { notifiableId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnread(notifiableId: string) {
    return this.notificationRepo.find({
      where: { notifiableId, readAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    return await this.notificationRepo.update(id, { readAt: new Date() });
  }

  async markAllAsRead(notifiableId: string) {
    await this.notificationRepo.update(
      { notifiableId, readAt: IsNull() },
      { readAt: new Date() },
    );
    return this.findAll(notifiableId);
  }
}
