/* eslint-disable no-console */
import { Job, type JobProgress } from "bullmq"
import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq"

import { MailQueueService } from "./queue.service"
import { MailQueuePayload } from "../interface/queue.interface"
import { MailTransporter } from "../interface/config.interface"
import { QueueRegistry } from "src/queues"

@Processor(QueueRegistry.MAIL)
export class MailQueueConsumer extends WorkerHost {
  constructor(private readonly mailQueueService: MailQueueService) {
    super()
  }

  /**
   * Main job processor
   */
  async process({ data, progress }: Job<MailQueuePayload, JobProgress, MailTransporter>): Promise<JobProgress> {
    await this.reportProgress(progress, 0)

    await this.mailQueueService.send(data)

    await this.reportProgress(progress, 100)
    return progress
  }

  /**
   * Example helper for reporting progress
   */
  private async reportProgress(progress: JobProgress, value: number) {
    if (typeof progress === "number") {
      progress = value
    }
  }

  /**
   * Triggered when a job completes successfully
   */
  @OnWorkerEvent("completed")
  onCompleted(job: Job<MailQueuePayload, JobProgress, MailTransporter>) {
    console.log(`✅ Job completed: ${job.id}, transporter: ${job.data.transport}`)
    // send a notification or log to a monitoring service here
  }

  /**
   * Triggered when a job fails
   */
  @OnWorkerEvent("failed")
  onFailed(job: Job<MailQueuePayload, JobProgress, MailTransporter>, error: Error) {
    console.error(`❌ Job failed: ${job.id}, transporter: ${job.data.transport}, error: ${error.message}`)
    // send alert to Slack/Sentry here
  }

  /**
   * Triggered on progress updates
   */
  @OnWorkerEvent("progress")
  onProgress(job: Job<MailQueuePayload, JobProgress, MailTransporter>, progress: JobProgress) {
    console.log(`📊 Job progress: ${job.id}, ${progress}%`)
  }
}
