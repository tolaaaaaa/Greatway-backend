import { ConfigModule } from '@nestjs/config';
import { seeder } from 'nestjs-seeder';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import mailConfig from './config/mail.config';
import filesystemsConfig from './config/filesystems.config';
import { databaseConfigAsync } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { UserSeeder } from './modules/seeder/user.seeder';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, filesystemsConfig],
    }),
    TypeOrmModule.forRootAsync(databaseConfigAsync),
    TypeOrmModule.forFeature([
        User
    ])
  ],
  providers: [UserSeeder]
}).run([
    UserSeeder
]);
