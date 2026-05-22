import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { HelpersService } from './helpers/helpers.service';
import { TransactionHelper } from './transactions/transactions.service';
import { DateService } from './date/date.service';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig)],
  providers: [HelpersService, TransactionHelper, DateService],
  exports: [HelpersService, TransactionHelper, DateService],
})
export class UtilsModule {}
