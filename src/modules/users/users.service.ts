import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { IUsersQuery } from './interface/query-filter';

@Injectable()
export class UsersService implements IService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto, manager?: EntityManager): Promise<User> {
    const repo = manager
      ? manager.getRepository<User>(User)
      : this.userRepository;
    const createUser = repo.create({ ...data });
    return await repo.save(createUser);
  }


    async find(query: IUsersQuery): Promise<[User[], number]> {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      role, 
      search 
    } = query;

    const where: FindOptionsWhere<User>[] = [];

    // Build where conditions
    const baseWhere: FindOptionsWhere<User> = {};
    
    if (status) {
      baseWhere.status = status;
    }
    
    if (role) {
      baseWhere.role = role;
    }

    // If search is provided, search by email or fullName
    if (search) {
      where.push(
        { ...baseWhere, email: ILike(`%${search}%`) },
        { ...baseWhere, fullName: ILike(`%${search}%`) },
      );
    } else {
      where.push(baseWhere);
    }

    return this.userRepository.findAndCount({
      where: where.length > 1 ? where : where[0],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }
  async findOne(filter: FindOptionsWhere<User>): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: filter,
    });

    return user;
  }
  exists(filter: FindOptionsWhere<User>): Promise<boolean> {
    return this.userRepository.exists({ where: filter });
  }
  update(
    entity: User,
    data: UpdateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager
      ? manager.getRepository<User>(User)
      : this.userRepository;
    const merged = repo.merge(entity, data);
    return repo.save(merged);
  }

  async remove(filter: FindOptionsWhere<User>): Promise<number> {
    const user = await this.userRepository.delete(filter)

    return user.affected ? user.affected : 0
  }
}
