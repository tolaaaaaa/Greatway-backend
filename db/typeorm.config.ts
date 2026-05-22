import { DataSource } from "typeorm"
import "tsconfig-paths/register"
import "dotenv/config"

const isLocal = process.env.NODE_ENV === "local"

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Always false when using migrations
  entities: [isLocal ? "src/**/*.entity.ts" : "dist/**/*.entity.js"], // If deploying with docker, migration is in the dist directory
  migrations: [isLocal ? "db/migrations/*.ts" : "dist/db/migrations/*.js"],
  migrationsTableName: "migrations",
  logging: false
})

export default dataSource
