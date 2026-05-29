import { registerAs } from "@nestjs/config"

export interface IRedisConfig {
  host: string
  port: number
  url: string
  ttl: number
}

export default registerAs(
  "redis",
  (): IRedisConfig => ({
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT),
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    ttl: parseInt(process.env.CACHE_DEFAULT_TTL!, 10) || 30 * 60 * 1000 // 30 minutes
  })
)
