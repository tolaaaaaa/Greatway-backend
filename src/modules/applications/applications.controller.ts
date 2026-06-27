import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { type IApplicationsQuery } from './interface/query-filter.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { docsImageFilter, memoryUpload } from 'src/config/multer.config';
import { BadReqException } from 'src/exceptions/badRequest.exception';
import { FileSystemService } from 'src/services/filesystem/filesystem.service';
import { CareersService } from '../careers/careers.service';
import { ApplicationInterceptor } from './interceptor/application.interceptor';
import { ApplicationsInterceptor } from './interceptor/applications.interceptor';
import { Public } from '../auth/decorators/public.decorator';
import { MailService } from 'src/services/mail';
import { NotificationService } from '../notification/notification.service';
import { NewApplicationNotification } from '../notification/services/application.notification';
import { ApplicationConfirmationMail } from 'src/mails/applicationConfirmation';
import { AdminApplicationNotificationMail } from 'src/mails/adminApplicationNotification';
import { UsersService } from '../users/users.service';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private fileSystemService: FileSystemService,
    private careersService: CareersService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private usersService: UsersService
  ) { }

  @Post()
  @Public()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ], {
    ...memoryUpload,
    fileFilter: docsImageFilter
  }))
  async create(@Body() createApplicationDto: CreateApplicationDto, @UploadedFiles() files: { resume?: CustomFile[], coverLetter?: CustomFile[] }) {
    const job = await this.careersService.findById(createApplicationDto.jobId)

    if (!job) throw new NotFoundException("Job does not exsts")

    const resumeUpload = files.resume?.[0]

    if (!resumeUpload) throw new BadReqException("Resume is required")



    const resumeUrl = await this.fileSystemService.upload({
      destination: `resume/${resumeUpload.originalname}`,
      mimetype: resumeUpload.mimetype,
      buffer: resumeUpload.buffer,
      filePath: resumeUpload.path
    })

    let coverLetterUrl: string | undefined;
    const coverLetterUpload = files.coverLetter?.[0];
    if (coverLetterUpload) {
      coverLetterUrl = await this.fileSystemService.upload({
        destination: `cover-letter/${coverLetterUpload.originalname}`,
        mimetype: coverLetterUpload.mimetype,
        buffer: coverLetterUpload.buffer,
        filePath: coverLetterUpload.path,
      });
    }


    createApplicationDto.resume = resumeUrl,
      createApplicationDto.coverLetter = coverLetterUrl
    const application = await this.applicationsService.create(createApplicationDto);

    const notification = new NewApplicationNotification(
      application.fullName,
      application.email,
      job.title,
      job.companyName,
    );

    this.mailService.queue(new ApplicationConfirmationMail(application, job.title, job.companyName)).catch((err) => {
      console.error('Failed to send application confirmation email:', err);
    });

    const superAdmin = await this.usersService.findOne({ role: 'super_admin' });
    if (superAdmin) {
      this.mailService.queue(new AdminApplicationNotificationMail(superAdmin.email, application, job.title, job.companyName)).catch((err) => {
        console.error('Failed to send super admin application notification email:', err);
      });

      this.notificationService.send({ id: superAdmin.id }, notification).catch((err) => {
        console.error('Failed to send super admin in-app notification:', err);
      });
    }


    const [admins] = await this.usersService.find({ role: 'admin' });
    for (const admin of admins) {
      this.mailService.queue(new AdminApplicationNotificationMail(admin.email, application, job.title, job.companyName)).catch((err) => {
        console.error(`Failed to send admin application notification email to ${admin.email}:`, err);
      });

      this.notificationService.send({ id: admin.id }, notification).catch((err) => {
        console.error(`Failed to send admin in-app notification to ${admin.id}:`, err);
      });
    }

    return application;
  }

  @Get()
  @UseInterceptors(ApplicationsInterceptor)
  findAll(@Query() query: IApplicationsQuery) {
    return this.applicationsService.find(query);
  }

  @Get(':id')
  @UseInterceptors(ApplicationInterceptor)
  async findOne(@Param('id') id: string) {
    const application = await this.applicationsService.findById(id);
    if (!application) throw new NotFoundException("Application does not exists")
    return application
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    const application = await this.applicationsService.findById(id)
    if (!application) throw new NotFoundException("Application does not exists")
    return this.applicationsService.update(application, updateApplicationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const application = await this.applicationsService.findById(id)
    if (!application) throw new NotFoundException("Application does not exists")
    if (application.coverLetter) {
      await this.fileSystemService.delete(application.coverLetter)
    }
    await this.fileSystemService.delete(application.resume)
    return this.applicationsService.remove({ id });
  }
}
