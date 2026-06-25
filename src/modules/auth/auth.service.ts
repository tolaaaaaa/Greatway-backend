import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HelpersService } from 'src/services/utils/helpers/helpers.service';
import { UsersService } from '../users/users.service';
import { LoginAuthDto, LoginDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { IAuth } from 'src/config/auth.config';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { DateService } from 'src/services/utils/date/date.service';
import { Otp } from './entity/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private helperService: HelpersService,
    private dateService: DateService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>
  ) { }

  async login(loginDto: LoginAuthDto) {
    const payload = { email: loginDto.email, id: loginDto.id };
    const token = await this.helperService.generateToken(
      payload,
      this.configService.get<IAuth>('auth')!.jwtSecret,
      '1d',
    );
    const refreshToken = await this.helperService.generateToken(
      payload,
      this.configService.get<IAuth>('auth')!.refreshSecret,
      '30d',
    );
    return { accessToken: token, refreshToken };
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.userService.findOne({
      email: loginDto.email.toLowerCase(),
    });

    if (!user) throw new NotFoundException('Invalid Credentials');

    const match = await user.comparePassword(loginDto.password);

    if (!match) throw new BadRequestException('Invalid Credentials');

    if (user.status != "active") throw new BadRequestException("User is inactive, contact support")

    return user;
  }

  async validateEmail(email: string): Promise<User | null> {
    const user = await this.userService.findOne({ email: email.toLowerCase() });
    if (!user) return null;
    return user;
  }

  async createOtp(email: string): Promise<Otp> {
    const code = this.helperService.generateOtp(6);
    const expiresAt = this.dateService.addMinutes(20);
    const otp = this.otpRepository.create({
      email,
      code,
      expiresAt,
    });
    return this.otpRepository.save(otp);
  }

  async findOtp(code: string) {
    const otp = await this.otpRepository.findOne({ where: { code } });
    return otp;
  }

  async findOtpEmail(email: string) {
    const otp = await this.otpRepository.findOne({ where: { email: email } })

    return otp
  }

  async deleteOtp(code: string) {
    const result = await this.otpRepository.delete({ code });
    return result.affected || 0;
  }
}
