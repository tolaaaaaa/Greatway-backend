import { SetMetadata } from "@nestjs/common"

export const IS_WEBHOOK = "isWebhook"
export const Webhook = () => SetMetadata(IS_WEBHOOK, true)
