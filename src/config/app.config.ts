import { registerAs } from "@nestjs/config"

type ENV = "local" | "development" | "staging" | "production"

export interface IApp {
  name: string
  env: ENV
  url: string
  clientUrl: string
  port: number
  swagger: {
    enabled: boolean
    title: string
    description: string
    version: string
  }
}

export default registerAs(
  "app",
  (): IApp => ({
    name: process.env.APP_NAME || "",
    env: (process.env.NODE_ENV as ENV) || "development",
    url: process.env.APP_URL || "http://localhost:5000",
    clientUrl: process.env.CLIENT_URL || "",
    port: Number(process.env.PORT) || 5000,
    swagger: {
      enabled:
        process.env.ENABLE_SWAGGER === "true" ||
        process.env.NODE_ENV === "development",
      title: "Great Way",
      description: "API documentation for Great Way Platform",
      version: "1.0",
    },
  })
)