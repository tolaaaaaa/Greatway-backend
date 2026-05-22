import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Trail } from './entities/trail.entity';
import { ITrailsQuery } from './interface/query-filter';

@Injectable()
export class TrailsService {
  constructor(
    @InjectRepository(Trail)
    private trailRepository: Repository<Trail>,
  ) {}

 async  find(query: ITrailsQuery): Promise<[Trail[], number]> {
    const { page = 1, limit = 10 } = query;

    const trails = await  this.trailRepository.findAndCount({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });

    return trails
  }

  async findById(id: string): Promise<Trail | null> {
    return await this.trailRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Trail>): Promise<Trail | null> {
    return await this.trailRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Trail>): Promise<boolean> {
    return await this.trailRepository.exists({ where: filter });
  }

  /**
   * Internal method to create a trail entry
   * Used by other services internally, not exposed via API
   */
  async create(description: string, manager?: EntityManager): Promise<Trail> {
    const repo = manager
      ? manager.getRepository<Trail>(Trail)
      : this.trailRepository;
    const trail = repo.create({ description });
    return await repo.save(trail);
  }
}