import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { DatabaseChannel } from './channels/database.channel';
import {
  NOTIFICATION_QUEUE,
  NotificationQueueProducer,
} from './queue/notification.queue-producer';
import { NotificationQueueConsumer } from './queue/notification.queue-consumer';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  providers: [
    DatabaseChannel,
    NotificationService,
    NotificationService,
    NotificationQueueProducer,
    NotificationQueueConsumer,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
