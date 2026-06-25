import { HttpException, Inject, Injectable } from '@nestjs/common';

import {
  MailClientsMap,
  type MailModuleOptions,
  MailTransporter,
} from './interface/config.interface';
import {
  IMailService,
  MailAddress,
  MailStrategy,
} from './interface/service.interface';

import { CONFIG_OPTIONS } from './entities/config';
import { MAIL_STRATEGY } from './entities/strategies';

import { SmtpMailStrategy } from './strategies/smtp.service';
import { ResendMailStrategy } from './strategies/resend.service';
import { Mailable } from './mailables/mailable';
import { MailQueueProducer } from './queue/queue-producer.service';

/**
 * Core MailService.
 * Provides a unified API to send or queue emails using different strategies (SMTP, Resend, etc.).
 */
@Injectable()
export class MailService implements IMailService {
  public from!: MailAddress;
  private default: keyof MailClientsMap;
  private clients: MailClientsMap;
  private strategyMap: Partial<Record<MailTransporter, MailStrategy>>;

  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: MailModuleOptions,
     private readonly mailQueue: MailQueueProducer,
    @Inject(MAIL_STRATEGY.smtp)
    private readonly smtpMailService: SmtpMailStrategy,
    @Inject(MAIL_STRATEGY.resend)
    private readonly resendMailService: ResendMailStrategy,
  ) {
    if (!options.default || !options.clients[options.default]) {
      throw new HttpException(
        `Invalid default transporter: ${options.default}`,
        500,
      );
    }
    this.default = options.default;
    this.clients = options.clients;
    this.strategyMap = {
      smtp: this.smtpMailService,
      resend: this.resendMailService,
    };
  }

  /**
   * Send a Mailable immediately using the default transporter.
   */
  async send(mail: Mailable): Promise<void> {
    await this.getTransporter(this.default).send(mail);
  }

  /**
   * Queue a Mailable for later sending using the default transporter.
   */
  async queue(mail: Mailable): Promise<void> {
     const options = this.clients[this.default]
    await this.mailQueue.dispatch(options.transport, mail, options.queueOptions)
  }

  /**
   * Retrieve a configured transporter strategy for a given client name.
   */
  getTransporter(client: string): MailStrategy {
    const options = this.clients[client];
    if (!options) throw new HttpException(`Invalid client: ${client}`, 500);

    const strategy = this.strategyMap[options.transport];
    if (!strategy) throw new HttpException(`No strategy registered for transport: ${options.transport}`, 500);

    return strategy.setOptions(options);
  }
}