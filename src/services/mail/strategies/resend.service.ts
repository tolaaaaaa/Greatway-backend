import { HttpException, Inject, Injectable } from '@nestjs/common';
import { MailAddress, MailStrategy } from '../interface/service.interface';
import { CreateEmailOptions, Resend } from 'resend';
import { type MailModuleOptions, ResendMailOptions } from '../interface/config.interface';
import { MailQueueProducer } from '../queue/queue-producer.service';
import { CONFIG_OPTIONS } from '../entities/config';
import { Mailable } from '../mailables/mailable';
import { ResendMessage } from '../interface/message.interface';

/**
 * Strategy for sending emails via Resend.
 * Implements MailStrategy to support sending, queuing, and runtime configuration.
 */
@Injectable()
export class ResendMailStrategy implements MailStrategy {
  private transporter!: Resend;
  private options!: ResendMailOptions;
  public from: MailAddress;

  constructor(
    private readonly mailQueue: MailQueueProducer,
    @Inject(CONFIG_OPTIONS) protected _options: MailModuleOptions,
  ) {
    this.from = _options.from;
  }

  /**
   * Configure Resend transport at runtime.
   * Must provide a valid API key.
   */
  setOptions(options: ResendMailOptions): MailStrategy {
    if (!options.apiKey) {
      throw new HttpException('Resend config not set', 500);
    }
    this.options = options;
    this.transporter = new Resend(options.apiKey);
    return this;
  }

  private ensureTransporter(): void {
    if (!this.transporter) {
      throw new HttpException('Resend configuration not set', 500);
    }
  }

  private async dispatch(message: ResendMessage): Promise<void> {
    const { error } = await this.transporter.emails.send(message as CreateEmailOptions);
    if (error) {
      throw new HttpException(error.message, error.statusCode ?? 500);
    }
  }

  /**
   * Send a Mailable instance immediately via Resend.
   */
  async send(mail: Mailable): Promise<void> {
    this.ensureTransporter();
    await this.dispatch(mail.getResendMessage(this.from));
  }

  /**
   * Queue a Mailable for later sending via MailQueueProducer.
   */
  async queue(mail: Mailable): Promise<void> {
    await this.mailQueue.dispatch('resend', mail, this.options.queueOptions);
  }

  /**
   * Send a fully-prepared Resend message directly.
   */
  async sendMessage(message: ResendMessage): Promise<void> {
    this.ensureTransporter();
    await this.dispatch(message);
  }
}