import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { IRedisConfig } from "src/config/redis.config"

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<IRedisConfig>("redis")

        return {
          connection: {
            host: config!.host,
            port: config!.port
          }
        }
      }
    })
  ]
})
export class QueuesModule {}
