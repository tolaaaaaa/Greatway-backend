import { registerAs } from "@nestjs/config"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { INestApplication } from "@nestjs/common"

export interface ISwagger {
  enabled: boolean
  title: string
  description: string
  version: string
}

export function setupSwagger(app: INestApplication, config: ISwagger): void {
  if (!config.enabled) return

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(config.title)
      .setDescription(config.description)
      .setVersion(config.version)
      .addBearerAuth()
      .build()
  )

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  })
}

export default registerAs(
  "swagger",
  (): ISwagger => ({
    enabled:
      process.env.ENABLE_SWAGGER === "true" ||
      process.env.NODE_ENV === "development",
    title: "Oyoyo Creator App API",
    description: "API documentation for Oyoyo Creator Platform",
    version: "1.0",
  })
)