import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, createBookingSchema } from './dto/create-booking.dto';
import { UpdateBookingDto, updateBookingSchema } from './dto/update-booking.dto';
import { BookingInterceptor } from './interceptors/booking.interceptor';
import { type IBookingsQuery } from './interface/query-filter.interface';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { BookingsInterceptor } from './interceptors/bookings.interface';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { Public } from '../auth/decorators/public.decorator';
import { BookingConfirmationMail } from 'src/mails/bookingConfirmation';
import { BookingAdminNotificationMail } from 'src/mails/adminBookingNotification';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/services/mail';
import { NotificationService } from '../notification/notification.service';
import { NewBookingNotification } from '../notification/services/admin-notication-booking';
import { BookingStatusMail } from 'src/mails/bookingStatusMail';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService,
    private usersService: UsersService,
    private mailService: MailService,
    private readonly notificationService: NotificationService,
  ) { }

  @Post()
  @Public()
  @UseInterceptors(BookingInterceptor)
  async create(
    @Body(new JoiValidationPipe(createBookingSchema)) createBookingDto: CreateBookingDto,
  ) {
    const booking = await this.bookingsService.create(createBookingDto);

    const admin = await this.usersService.findOne({ role: "super_admin" })


    // confirmation to user — non-blocking
    this.mailService.queue(new BookingConfirmationMail(booking)).catch((err) => {
      console.error('Failed to send booking confirmation email:', err);
    });


    if (admin) {
      // notification to admin — non-blocking
      this.mailService.queue(new BookingAdminNotificationMail(admin?.email, booking)).catch((err) => {
        console.error('Failed to send admin booking notification email:', err);
      });

      this.notificationService
        .send(
          { id: admin.id },
          new NewBookingNotification(
            `${booking.firstName} ${booking.lastName}`,
            booking.email,
            booking.location,
            booking.inspectionDate,
          ),
        )
        .catch((err) => {
          console.error('Failed to send admin in-app notification:', err);
        });
    }

    const [admins] = await this.usersService.find({ role: "admin" })

    for (const admin of admins) {
      this.mailService.queue(new BookingAdminNotificationMail(admin.email, booking)).catch((err) => {
        console.error(`Failed to send admin booking notification email to ${admin.email}:`, err);
      });

      this.notificationService
        .send(
          { id: admin.id },
          new NewBookingNotification(
            `${booking.firstName} ${booking.lastName}`,
            booking.email,
            booking.location,
            booking.inspectionDate,
          ),
        )
        .catch((err) => {
          console.error('Failed to send admin in-app notification:', err);
        });

    }

    return booking
  }

  @Get()
  @UseInterceptors(BookingsInterceptor)
  async findAll(@Query() query: IBookingsQuery) {
    return this.bookingsService.find(query);
  }

  @Get(':id')
  @UseInterceptors(BookingInterceptor)
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) throw new NotFoundException('Booking does not exist');
    return booking;
  }

  @Patch(':id')
  @UseInterceptors(BookingInterceptor)
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateBookingSchema)) updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) throw new NotFoundException('Booking does not exist');
    const updated = await this.bookingsService.update(booking, updateBookingDto);
    
    this.mailService.queue(new BookingStatusMail(updated)).catch((err) => {
      console.error('Failed to send booking status email:', err);
    });

    return updated
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) throw new NotFoundException('Booking does not exist');
    return this.bookingsService.remove({ id });
  }
}