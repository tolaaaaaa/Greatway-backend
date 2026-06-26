import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BOOKING_STATUS } from "../enum/booking-status.enun";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    firstName!: string

    @Column()
    lastName!: string

    @Column()
    phoneNumber!: string

    @Column()
    email!: string

    @Column()
    location!: string

    @Column()
    inspectionDate!: Date

    @Column()
    inspectionTime!: Date

    @Column({ type: "text", nullable: true })
    message?: string

    @Column({ type: "enum", enum: BOOKING_STATUS, default: BOOKING_STATUS.PENDING })
    status!: BOOKING_STATUS

    @Column({ type: "text", nullable: true })
    declineReason?: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
