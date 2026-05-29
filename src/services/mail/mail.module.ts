import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  MailModuleAsyncOptions,
  MailModuleOptions,
} from './interface/config.interface';
import { CONFIG_OPTIONS } from './entities/config';
import { MailService } from './mail.service';
import { MAIL_STRATEGY } from './entities/strategies';
import { SmtpMailStrategy } from './strategies/smtp.service';
import { ResendMailStrategy } from './strategies/resend.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueRegistry } from 'src/queues';
import { MailQueueConsumer } from './queue/queue-consumer.service';
import { MailQueueProducer } from './queue/queue-producer.service';
import { MailQueueService } from './queue/queue.service';

@Module({})
export class MailModule {
  /**
   * Synchronous registration of the MailModule.
   * Useful when configuration is available at module import time.
   */
  static register(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [
        ConfigModule,
        BullModule.registerQueue({ name: QueueRegistry.MAIL }),
      ],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: MAIL_STRATEGY.smtp,
          useClass: SmtpMailStrategy,
        },
        {
          provide: MAIL_STRATEGY.resend,
          useClass: ResendMailStrategy,
        },
        MailService,
        MailQueueService,
        MailQueueProducer,
        MailQueueConsumer,
      ],
      exports: [
        MailService,
        CONFIG_OPTIONS,
        MAIL_STRATEGY.smtp,
        MAIL_STRATEGY.resend,
      ],
    };
  }

  /**
   * Asynchronous registration of the MailModule.
   * Useful when configuration depends on async providers or other modules.
   */
  static registerAsync(options: MailModuleAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [
        ...(options.imports || []),
        BullModule.registerQueue({ name: QueueRegistry.MAIL }),
      ],
      providers: [
        {
          provide: CONFIG_OPTIONS!,
          useFactory: options.useFactory!,
          inject: options.inject || [],
        },
        {
          provide: MAIL_STRATEGY.smtp,
          useClass: SmtpMailStrategy,
        },
        {
          provide: MAIL_STRATEGY.resend,
          useClass: ResendMailStrategy,
        },
        MailService,
        MailQueueService,
        MailQueueProducer,
        MailQueueConsumer,
      ],
      exports: [
        MailService,
        CONFIG_OPTIONS,
        MAIL_STRATEGY.smtp,
        MAIL_STRATEGY.resend,
      ],
    };
  }
}
