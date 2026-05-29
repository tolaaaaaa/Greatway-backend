
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  notifiableId!: string;

  @Column()
  type!: string;

  @Column({ type: 'jsonb' })
  data!: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true, default: null })
  readAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}