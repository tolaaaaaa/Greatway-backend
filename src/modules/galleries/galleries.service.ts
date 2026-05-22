import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Gallery } from './entities/gallery.entity';
import { IGallerysQuery } from './interface/query-filter';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  async create(
    data: CreateGalleryDto,
    manager?: EntityManager,
  ): Promise<Gallery> {
    const repo = manager
      ? manager.getRepository<Gallery>(Gallery)
      : this.galleryRepository;
    const create = repo.create(data);
    return await repo.save(create);
  }

  find(query: IGallerysQuery): Promise<[Gallery[], number]> {
    const { page = 1, limit = 10 } = query;

    return this.galleryRepository.findAndCount({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Gallery | null> {
    return await this.galleryRepository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Gallery>): Promise<Gallery | null> {
    return await this.galleryRepository.findOne({ where: filter });
  }

  async exists(filter: FindOptionsWhere<Gallery>): Promise<boolean> {
    return await this.galleryRepository.exists({ where: filter });
  }

  async update(
    entity: Gallery,
    data: UpdateGalleryDto,
    manager?: EntityManager,
  ): Promise<Gallery> {
    const repo = manager
      ? manager.getRepository<Gallery>(Gallery)
      : this.galleryRepository;

    const update = repo.merge(entity, data);
    return await repo.save(update);
  }

  async remove(filter: FindOptionsWhere<Gallery>): Promise<number> {
    const gallery = await this.galleryRepository.delete(filter);
    return gallery.affected || 0;
  }
}