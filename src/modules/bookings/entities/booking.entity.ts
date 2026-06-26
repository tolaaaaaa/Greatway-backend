import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    firstName!: string

    @Column()
    lastName!: string

    @Column()
    email!: string

    @Column()
    location!: string

    @Column()
    inspectionDate!: Date

    @Column()
    inspectionTime!: Date

    @Column({type: "text", nullable: true})
    message?: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
