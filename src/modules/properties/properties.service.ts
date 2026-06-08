import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { Between, EntityManager, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IPropertiesQuery } from './interface/query-filter.interface';

@Injectable()
export class PropertiesService implements IService<Property> {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(
    data: CreatePropertyDto,
    manager?: EntityManager,
  ): Promise<Property> {
    const repo = manager
      ? manager.getRepository<Property>(Property)
      : this.propertyRepository;
    const create = repo.create({
      ...data,
      features:
        data.features?.map((f) => ({
          description: f.description,
          icon: f.icon,
        })) ?? [],
    });
    return await repo.save(create);
  }

  find(query: IPropertiesQuery): Promise<[Property[], number]> {
    const { page = 1, limit = 10, location, status, minPrice, maxPrice, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (location) where.location = ILike(`%${location}%`);
    if (status) where.status = status;

    // price filters using TypeORM FindOperators
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.salesPrice = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.salesPrice = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.salesPrice = LessThanOrEqual(maxPrice);
    }

    // build where option to support OR (search) or single where
    const whereOption = search
      ? [
          { ...where, title: ILike(`%${search}%`) },
          { ...where, description: ILike(`%${search}%`) },
        ]
      : where;

    return this.propertyRepository.findAndCount({
      where: whereOption,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { [sortBy || 'createdAt']: sortOrder || 'DESC' },
      relations: { features: true },
    });
  }

  async findById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Property>): Promise<Property | null> {
    return await this.propertyRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Property>): Promise<boolean> {
    return await this.propertyRepository.exists({ where: filter });
  }

  async update(
    entity: Property,
    data: UpdatePropertyDto,
    manager?: EntityManager,
  ): Promise<Property> {
    const repo = manager
      ? manager.getRepository<Property>(Property)
      : this.propertyRepository;

    const update = repo.merge(entity, data);
    return await repo.save(update);
  }

  async remove(filter: FindOptionsWhere<Property>): Promise<number> {
    const property = await this.propertyRepository.delete(filter);
    return property.affected || 0;
  }
}
