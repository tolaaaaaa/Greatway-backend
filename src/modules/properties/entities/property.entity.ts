import { PropertyFeature } from 'src/modules/property-features/entities/property-feature.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PropertyStatus } from '../interface/property-status.interface';
import { PROPERTY_STATUS } from '../enum/property-status.enum';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  salesPrice!: string;

  @Column()
  location!: string;

  @Column({type: "enum", enum: PROPERTY_STATUS, default: "unlisted"})
  status!: PropertyStatus

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-array', default: [] })
  imageUrls!: string[];

  @OneToMany(() => PropertyFeature, (feature) => feature.property, {
    cascade: true,
    eager: true,
  })
  features!: PropertyFeature[];

  @Column({ type: 'text', default: '' })
  videoUrl!: string;


  @Column({ type: 'text', default: '' })
  saleSupportAvatar!: string

  @Column()
  supportInCharge!: string;

  @Column()
  whatsAppNumber!: string;

  @Column()
  altNumber!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
