import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { AuthDto, LoginDto, loginSchema, registerSchema } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { ConflictException } from 'src/exceptions/conflict.exception';
import { HelpersService } from 'src/services/utils/helpers/helpers.service';
import { ConfigService } from '@nestjs/config';
import { IAuth } from 'src/config/auth.config';
import type { Request } from 'express';
import { LoginValidationGuard } from './guard/login-validation.guard';
import { PasswordAuthGuard } from './guard/password-auth.guard';
import { UnAuthorizedException } from 'src/exceptions/unAuthorized.exception';
import { ForbiddenException } from 'src/exceptions/forbidden.exception';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { MailService } from 'src/services/mail';
import { AdminRegisteredNotification } from 'src/mails/adminRegister';
import { NotificationService } from '../notification/notification.service';
import { AdminNotification } from '../notification/services/admin-notification';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersSevice: UsersService,
    private helperService: HelpersService,
    private configService: ConfigService,
    private mailService: MailService,
    private notificationService: NotificationService,
  ) {}

  @Public()
  @Post('/register/admin')
  async registerAdmin(
    @Body(new JoiValidationPipe(registerSchema)) authDto: AuthDto,
  ) {
    const user = await this.usersSevice.findOne({ email: authDto.email });

    if (user) throw new ConflictException('User Exist');

    authDto.role = 'admin';

    const createUser = await this.usersSevice.create({
      ...authDto,
      status: 'inactive',
    });

    const token = await this.helperService.generateToken(
      {
        email: createUser.email,
        id: createUser.id,
      },
      this.configService.get<IAuth>('auth')!.jwtSecret,
      '1d',
    );

    const superAdmin = await this.usersSevice.findOne({
      role: 'super_admin',
    });

    if (superAdmin) {
      this.mailService
        .send(
          new AdminRegisteredNotification(
            superAdmin.email,
            createUser.fullName,
            createUser.email,
          ),
        )
        .catch((error) => {
          console.error('Failed to send admin registration mail:', error);
        });

      this.notificationService
        .send(
          { id: superAdmin.id },
          new AdminNotification(createUser.fullName, createUser.email),
        )
        .catch((error) => {
          console.error(
            'Failed to send admin registration notification:',
            error,
          );
        });
    }
    return { token };
  }

  @Public()
  @Post('/login/admin')
  @UseInterceptors(AuthInterceptor)
  @UseGuards(LoginValidationGuard, PasswordAuthGuard)
  async loginAdmin(
    @Req() req: Request & { user: Express.User },
    @Body(new JoiValidationPipe(loginSchema)) loginDto: LoginDto,
  ) {
    const user = req.user;

    if (user.role === 'user')
      throw new ForbiddenException(
        `User with role ${user.role} cannot log in as a Admin. only 'Admin' or a 'Super Admin' is allowed to log in`,
      );

    const tokens = await this.authService.login({
      email: user.email,
      id: user.id,
    });

    return { user: req.user, tokens };
  }
}
