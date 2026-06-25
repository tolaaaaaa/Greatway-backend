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
      const seedEmail = 'olanitori00@gmail.com';

      const findUser = await this.userRepository.findOne({
        where: { email: seedEmail },
      });

      if (findUser) {
        if (!findUser.isEmailVerified) {
          const merge = this.userRepository.merge(findUser, {isEmailVerified: true})
          await this.userRepository.save(merge)
        }
        console.log('User already exists, skipping seed.');
        return;
      }

      const seedUser = this.userRepository.create({
        email: seedEmail,
        password: 'Password123!',
        fullName: 'Greatway Properties',
        status: 'active',
        role: 'super_admin',
        isEmailVerified: true
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
    try {
      await this.userRepository.clear();
    } catch (error) {
      console.error('Failed to drop users:', error);
    }
  }
}
