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

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public()
  @UseInterceptors(BookingInterceptor)
  async create(
    @Body(new JoiValidationPipe(createBookingSchema)) createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(createBookingDto);
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
    return this.bookingsService.update(booking, updateBookingDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) throw new NotFoundException('Booking does not exist');
    return this.bookingsService.remove({ id });
  }
}