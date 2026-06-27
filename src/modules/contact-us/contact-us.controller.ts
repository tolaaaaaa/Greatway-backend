import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto, createContactUsSchema } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/services/mail';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { ContactAdminNotificationMail } from 'src/mails/contactAdminNotification';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly mailService: MailService,
    private readonly usersService: UsersService) { }

  @Post()
  async create(@Body(new JoiValidationPipe(createContactUsSchema)) createContactUsDto: CreateContactUsDto) {
    const superAdmin = await this.usersService.findOne({ role: 'super_admin' });

    if (superAdmin) {
      this.mailService.queue(new ContactAdminNotificationMail(superAdmin.email, createContactUsDto)).catch((err) => {
        console.error('Failed to send contact notification email to super admin:', err);
      });
    }

    const [admins] = await this.usersService.find({ role: 'admin' });
    for (const admin of admins) {
      this.mailService.queue(new ContactAdminNotificationMail(admin.email, createContactUsDto)).catch((err) => {
        console.error(`Failed to send contact notification email to ${admin.email}:`, err);
      });
    }

    return { message: 'Your enquiry has been received. We will be in touch shortly.' };
  }

}

