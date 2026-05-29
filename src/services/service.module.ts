import { Global, Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { PaginationModule, PaginationService } from './pagination';
import { FileSystemModule } from './filesystem/filesystem.module';
import { FileSystemService } from './filesystem/filesystem.service';
import { fileConfigAsync } from 'src/config/filesystems.config';
import { MailModule, MailService } from './mail';
import { mailConfigAsync } from 'src/config/mail.config';

@Global()
@Module({
  imports: [
    UtilsModule,
    PaginationModule,
    FileSystemModule.registerAsync(fileConfigAsync),
    MailModule.registerAsync(mailConfigAsync),
  ],
  providers: [PaginationService, MailService],
  exports: [UtilsModule, PaginationService, FileSystemModule, MailService],
})
export class ServicesModule {}
