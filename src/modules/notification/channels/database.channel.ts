// src/notifications/channels/database.channel.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../interface/notification.interface';
import { NotificationEntity } from '../entities/notification.entity';

@Injectable()
export class DatabaseChannel {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async send(notifiable: { id: string }, notification: Notification): Promise<void> {
    await this.notificationRepo.save({
      notifiableId: notifiable.id,
      type: notification.constructor.name,
      data: notification.toDatabase(),
      readAt: null,
    });
  }
}