import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IApplicationsQuery } from './interface/query-filter.interface';

@Injectable()
export class ApplicationsService implements IService<Application> {
  constructor(
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
  ) {}

  async create(data: CreateApplicationDto & { resume: string; coverLetter?: string }, manager?: EntityManager): Promise<Application> {
    const repo = manager
      ? manager.getRepository<Application>(Application)
      : this.applicationRepository;
    const create = repo.create({ ...data });
    return await repo.save(create);
  }

  find(query: IApplicationsQuery): Promise<[Application[], number]> {
    const { page = 1, limit = 10, jobId } = query;

    const where: FindOptionsWhere<Application> = {};
    if (jobId) where.jobId = jobId;

    return this.applicationRepository.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Application | null> {
    return await this.applicationRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Application>): Promise<Application | null> {
    return await this.applicationRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Application>): Promise<boolean> {
    return await this.applicationRepository.exists({ where: filter });
  }

  async update(entity: Application, data: UpdateApplicationDto, manager?: EntityManager): Promise<Application> {
    const repo = manager
      ? manager.getRepository<Application>(Application)
      : this.applicationRepository;
    const update = repo.merge(entity, data);
    return await repo.save(update);
  }

  async remove(filter: FindOptionsWhere<Application>): Promise<number> {
    const result = await this.applicationRepository.delete(filter);
    return result.affected || 0;
  }
}