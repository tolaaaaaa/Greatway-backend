import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Otp {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    email!: string

    @Column()
    code!: string

    @Column()
    expiresAt!: Date

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}