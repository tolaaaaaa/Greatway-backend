
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DatabaseChannel } from '../channels/database.channel';
import { NOTIFICATION_QUEUE } from './notification.queue-producer';

@Processor(NOTIFICATION_QUEUE)
export class NotificationQueueConsumer extends WorkerHost {
  constructor(private readonly databaseChannel: DatabaseChannel) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { notifiableId, type, data } = job.data;

    const payload = {
      ...data,
      type,
    };

    await this.databaseChannel.send({ id: notifiableId }, payload);
  }
}