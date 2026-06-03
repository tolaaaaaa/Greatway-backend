import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    try {
      const findUser = await this.userRepository.findOne({
        where: { email: 'greatwayproperties26@gmail.com' },
      });

      if (findUser) {
        console.log('User already exists, skipping seed.');
        return;
      }

      const seedUser = this.userRepository.create({
        email: 'olanitori00@gmail.com',
        password: 'Password123!',
        fullName: 'greatway properties',
        status: 'active',
        role: 'super_admin',
      });

      await this.userRepository.save(seedUser);
      console.log('User seeded successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      console.error(message, error);
    }
  }

  async drop(): Promise<any> {
    await this.userRepository.deleteAll();
  }
}
