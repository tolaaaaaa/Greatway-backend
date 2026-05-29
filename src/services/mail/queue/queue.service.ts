import { HttpException, Inject, Injectable } from '@nestjs/common';

import { CONFIG_OPTIONS } from '../entities/config';
import { MAIL_STRATEGY } from '../entities/strategies';
import { MailQueuePayload } from '../interface/queue.interface';
import {
  MailClientsMap,
  type MailModuleOptions,
  MailTransporter,
} from '../interface/config.interface';
import {
  IMailQueueService,
  MailAddress,
  MailStrategy,
} from '../interface/service.interface';
import { SmtpMailStrategy } from '../strategies/smtp.service';

/**
 * Service responsible for consuming the mail queue and sending emails.
 *
 * Uses the configured mail strategies (SMTP, SES, Mailgun) and dispatches
 * messages to the appropriate strategy based on the transport type.
 */
@Injectable()
export class MailQueueService implements IMailQueueService {
  /**
   * Default sender address
   */
  public from: MailAddress;

  /**
   * Configured clients mapping (keyed by client name)
   */
  private clients: MailClientsMap;

  /**
   * Mapping from transport type to strategy instance
   */
  private strategyMap: Partial<Record<MailTransporter, MailStrategy>>;

  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: MailModuleOptions,
    @Inject(MAIL_STRATEGY.smtp)
    private readonly smtpMailService: SmtpMailStrategy,
  ) {
    if (!options.default || !options.clients[options.default]) {
      throw new HttpException(
        `Invalid default transporter: ${options.default}`,
        500,
      );
    }
    this.from = options.from;
    this.clients = options.clients;
    this.strategyMap = {
      smtp: this.smtpMailService,
    };
  }

  /**
   * Send a queued mail payload using the appropriate transport strategy.
   *
   * Steps:
   * 1. Look up the client options for the payload's transport.
   * 2. Retrieve the corresponding strategy instance.
   * 3. Configure the strategy with the client options.
   * 4. Send the message.
   *
   * @param data Mail payload containing transport type and message data
   */
  async send(data: MailQueuePayload): Promise<void> {
    const strategy = this.strategyMap[data.transport];
    if (!strategy)
      throw new HttpException(
        `No strategy registered for transport: ${data.transport}`,
        500,
      );

    const options = this.clients[data.transport];
    await strategy.setOptions(options).sendMessage(data.data);
  }
}
