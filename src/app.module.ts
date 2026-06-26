import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrailsModule } from './modules/trails/trails.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { CareersModule } from './modules/careers/careers.module';
import { GalleriesModule } from './modules/galleries/galleries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfigAsync } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import swaggerConfig from './config/swagger.config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilters } from './exceptions/global.exception';
import { ServicesModule } from './services/service.module';
import { PropertyFeaturesModule } from './modules/property-features/property-features.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import filesystemsConfig from './config/filesystems.config';
import { JwtGuard } from './modules/auth/guard/jwt-auth.guard';
import { NotificationModule } from './modules/notification/notification.module';
import mailConfig from './config/mail.config';
import redisConfig from './config/redis.config';
import { QueuesModule } from './queues';
import { ApplicationsModule } from './modules/applications/applications.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfigAsync),
    QueuesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, swaggerConfig, filesystemsConfig, mailConfig, redisConfig],
    }),
    UsersModule,
    AuthModule,
    TrailsModule,
    ServicesModule,
    PropertiesModule,
    CareersModule,
    GalleriesModule,
    PropertyFeaturesModule,
    AnalyticsModule,
    NotificationModule,
    ApplicationsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilters
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
     {
      provide: APP_GUARD,
      useClass: JwtGuard
    }
  ],
})
export class AppModule {}
