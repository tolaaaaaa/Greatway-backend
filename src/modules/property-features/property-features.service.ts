import { Injectable } from '@nestjs/common';
import { CreatePropertyFeatureDto } from './dto/create-property-feature.dto';
import { UpdatePropertyFeatureDto } from './dto/update-property-feature.dto';
import { PropertyFeature } from './entities/property-feature.entity';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PropertyFeaturesService implements IService<PropertyFeature> {
  constructor(
    @InjectRepository(PropertyFeature)
    private featureRepository: Repository<PropertyFeature>,
  ) {}

  async create(
    data: CreatePropertyFeatureDto,
    manager?: EntityManager,
  ): Promise<PropertyFeature> {
    const repo = manager
      ? manager.getRepository<PropertyFeature>(PropertyFeature)
      : this.featureRepository;
    const create = repo.create({ ...data });
    return await repo.save(create);
  }

  find(): Promise<[PropertyFeature[], number]> {
    throw new Error('Method not implemented.');
  }

  async findAll(
    filter: FindOptionsWhere<PropertyFeature>,
  ): Promise<PropertyFeature[]> {
    return await this.featureRepository.find({ where: filter });
  }

  async findById(id: string): Promise<PropertyFeature | null> {
    return await this.featureRepository.findOne({ where: { id } });
  }

  async findOne(
    filter: FindOptionsWhere<PropertyFeature>,
  ): Promise<PropertyFeature | null> {
    return await this.featureRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<PropertyFeature>): Promise<boolean> {
    return await this.featureRepository.exists({ where: filter });
  }

  async update(
    entity: PropertyFeature,
    data: UpdatePropertyFeatureDto,
    manager?: EntityManager,
  ): Promise<PropertyFeature> {
    const repo = manager
      ? manager.getRepository<PropertyFeature>(PropertyFeature)
      : this.featureRepository;

    const update = repo.merge(entity, data);
    return await repo.save(update);
  }

  async remove(filter: FindOptionsWhere<PropertyFeature>): Promise<number> {
    const result = await this.featureRepository.delete(filter);
    return result.affected || 0;
  }
}
