import { Career } from "src/modules/careers/entities/career.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class Application {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    fullName!: string

    @Column()
    email!: string

    @Column()
    phoneNumber!: string

    @Column()
    resume!: string

    @Column({ type: "text", nullable: true })
    coverLetter?: string


    @ManyToOne(() => Career, (career) => career.applications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "jobId" })
    job!: Career;

    @Column()
    jobId!: string;

    @Column()
    startDate!: Date


    @CreateDateColumn()
    createdAt!: Date


    @UpdateDateColumn()
    updatedAt!: Date
}
