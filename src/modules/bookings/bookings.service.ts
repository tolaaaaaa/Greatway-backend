import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { IBookingsQuery } from './interface/query-filter.interface';

@Injectable()
export class BookingsService implements IService<Booking> {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
  ) {}

  async create(data: CreateBookingDto, manager?: EntityManager): Promise<Booking> {
    const repo = manager
      ? manager.getRepository<Booking>(Booking)
      : this.bookingRepository;
    const booking = repo.create({ ...data });
    return await repo.save(booking);
  }

  find(query: IBookingsQuery): Promise<[Booking[], number]> {
    const { page = 1, limit = 10, location } = query;

    const where: FindOptionsWhere<Booking> = {};
    if (location) where.location = location;

    return this.bookingRepository.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Booking>): Promise<Booking | null> {
    return await this.bookingRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Booking>): Promise<boolean> {
    return await this.bookingRepository.exists({ where: filter });
  }

  async update(entity: Booking, data: UpdateBookingDto, manager?: EntityManager): Promise<Booking> {
    const repo = manager
      ? manager.getRepository<Booking>(Booking)
      : this.bookingRepository;
    const updated = repo.merge(entity, data);
    return await repo.save(updated);
  }

  async remove(filter: FindOptionsWhere<Booking>): Promise<number> {
    const result = await this.bookingRepository.delete(filter);
    return result.affected || 0;
  }
}