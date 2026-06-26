import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { CareerStatus } from "../interface/career.status.interface"
import { CAREER_STATUS } from "../enum/career-status.enum";
import type { EmploymentType } from "../interface/career.employment-type.interface"
import { EMPLOYMENT_TYPE } from "../enum/career-employment-type.enum";
import { Application } from "src/modules/applications/entities/application.entity";

@Entity()
export class Career {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    title!: string

    @Column({ type: "text", default: "" })
    description!: string

    @Column({ type: "enum", enum: EMPLOYMENT_TYPE, default: "full-time" })
    employmentType!: EmploymentType

    @Column()
    location!: string

    @Column({ type: "enum", enum: CAREER_STATUS, default: "open" })
    status!: CareerStatus

    @Column()
    companyName!: string

    @OneToMany(() => Application, (application) => application.job)
    applications!: Application[];

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
