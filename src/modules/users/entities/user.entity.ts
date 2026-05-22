import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import type { UserStatus } from '../interface/user.status.interface';
import { USER_STATUS } from '../enum/user-status';
import { USER_ROLE } from '../enum/user-role';
import type { UserRole } from '../interface/user.role.inteface';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', default: '' })
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'text', default: '' })
  phoneNumber?: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: USER_STATUS, default: 'inactive' })
  status!: UserStatus;

  @Column({type: 'enum', enum: USER_ROLE, default: "user"})
  role!: UserRole

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  private _previousPassword?: string;

  @AfterLoad()
  loadPassword() {
    this._previousPassword = this.password;
  }

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    if (!this.password || this.password === this._previousPassword) return;

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }
}
