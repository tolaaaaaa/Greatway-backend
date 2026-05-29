import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordStrategy } from './strategies/password.strategy';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UsersModule, JwtModule.registerAsync(jwtConfig), NotificationModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordStrategy, JwtService],
})
export class AuthModule {}
