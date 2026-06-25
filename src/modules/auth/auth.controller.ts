import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  HttpCode,
  Patch
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { AuthDto, ChangePasswordDto, changePasswordSchema, ForgotPasswordDto, forgotPasswordSchema, LoginDto, loginSchema, registerSchema, ResendOtpDto, resendOtpSchema, VerifyEmailDto, verifyEmailSchema } from './dto/auth.dto';
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
import { NotificationService } from '../notification/notification.service';
import { AdminNotification } from '../notification/services/admin-notification';
import { WelcomeUser } from 'src/mails/welcomeUser';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { IApp } from 'src/config/app.config';
import { ForgotPasswordMail } from 'src/mails/forgotPassword';
import { BadReqException } from 'src/exceptions/badRequest.exception';
import { ResendOtpMail } from 'src/mails/resendOtp';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersSevice: UsersService,
    private helperService: HelpersService,
    private configService: ConfigService,
    private mailService: MailService,
    private notificationService: NotificationService
  ) { }

  @Public()
  @HttpCode(200)
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

    const otp = await this.authService.createOtp(createUser.email);

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

    await this.mailService.queue(new WelcomeUser(createUser.email, createUser.fullName, otp.code))


    return { token };
  }


  @Public()
  @HttpCode(200)
  @Post("verify-email")
  async verifyEmail(@Body(new JoiValidationPipe(verifyEmailSchema)) verifyEmailDto: VerifyEmailDto) {
    const otp = await this.authService.findOtp(verifyEmailDto.code);

    if (!otp) throw new UnAuthorizedException("Invalid OTP");

    if (new Date() > otp.expiresAt) {
      await this.authService.deleteOtp(verifyEmailDto.code);
      throw new UnAuthorizedException("OTP has expired");
    }

    const user = await this.usersSevice.findOne({ email: otp.email });

    if (!user) throw new UnAuthorizedException("User not found");


    await this.usersSevice.update(user, { status: "active", isEmailVerified: true });
    return {
      message: "email verified"
    }
  }


  @Public()
  @HttpCode(200)
  @Post("resend-otp")
  async resendOtp(@Body(new JoiValidationPipe(resendOtpSchema)) resendOtpDto: ResendOtpDto) {
    const user = await this.usersSevice.findOne({ email: resendOtpDto.email })

    if (!user) throw new NotFoundException("User does not exists")

    const otpExists = await this.authService.findOtpEmail(user.email)

    if (otpExists) {
      await this.authService.deleteOtp(otpExists.code)
    }

    const otp = await this.authService.createOtp(user.email);

    await this.mailService.send(new ResendOtpMail(user.email, user.fullName, otp.code)).catch((err) => {
      console.error('Failed to send OTP email:', err);
    });

    return {
      message: "Otp sent"
    }
  }


  @Public()
  @HttpCode(200)
  @Post("forgot-password")
  async forgotPassword(@Body(new JoiValidationPipe(forgotPasswordSchema)) forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersSevice.findOne({ email: forgotPasswordDto.email })
    if (!user) throw new NotFoundException("User does not exists")

    const clientUrl = this.configService.get<IApp>("app")!.clientUrl
    const token = await this.helperService.generateToken(
      {
        email: user.email,
        id: user.id,
      },
      this.configService.get<IAuth>('auth')!.jwtSecret,
      '30m',
    );

    const url = `${clientUrl}/reset-password?token=${token}`

    await this.mailService.queue(new ForgotPasswordMail(user.email, user.fullName, url));
    return {
      message: "Link sent to users email"
    }
  }

  @Patch("reset-password")
  async changePassword(@Body(new JoiValidationPipe(changePasswordSchema)) changePasswordDto: ChangePasswordDto, @Req() req: Request & { user: Express.User }) {
    const authUser = req.user

    const user = await this.usersSevice.findById(authUser.id)

    if (!user) throw new NotFoundException("User not found")

    const updatePassword = await this.usersSevice.update(user, { password: changePasswordDto.password })

    if (!updatePassword) throw new BadReqException("Something went wrong")

    return {
      message: "Password changed successfully"
    }
  }

  @Public()
  @HttpCode(200)
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
