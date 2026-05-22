import { Injectable } from '@nestjs/common';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { Career } from './entities/career.entity';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ICareersQuery } from './interface/query-filter.interface';

@Injectable()
export class CareersService implements IService<Career> {
  constructor(
    @InjectRepository(Career) private careerRepository: Repository<Career>,
  ) {}

  async create(
    data: CreateCareerDto,
    manager?: EntityManager,
  ): Promise<Career> {
    const repo = manager
      ? manager.getRepository<Career>(Career)
      : this.careerRepository;
    const create = repo.create({ ...data });
    return await repo.save(create);
  }

  find(query: ICareersQuery): Promise<[Career[], number]> {
    const { page = 1, limit = 10, status, employmentType, location } = query

    const where: FindOptionsWhere<Career> = {}
    if (status) where.status = status
    if (employmentType) where.employmentType = employmentType
    if (location) where.location = location

    return this.careerRepository.findAndCount({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { createdAt: "DESC" }
    })
}

  async findById(id: string): Promise<Career | null> {
    return await this.careerRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Career>): Promise<Career | null> {
    return await this.careerRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Career>): Promise<boolean> {
    const career = await this.careerRepository.exists({ where: filter });
    return career
  }

  async update(
    entity: Career,
    data: UpdateCareerDto,
    manager?: EntityManager,
  ): Promise<Career> {
    const repo = manager
      ? manager.getRepository<Career>(Career)
      : this.careerRepository;

    const update = repo.merge(entity, data);
    return await repo.save(update);
  }

  async remove(filter: FindOptionsWhere<Career>): Promise<number> {
    const career = await this.careerRepository.delete(filter);
    return career.affected || 0;
  }
}
