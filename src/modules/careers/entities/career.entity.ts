import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type {CareerStatus} from "../interface/career.status.interface"
import { CAREER_STATUS } from "../enum/career-status.enum";
import type {EmploymentType} from "../interface/career.employment-type.interface"
import { EMPLOYMENT_TYPE } from "../enum/career-employment-type.enum";

@Entity()
export class Career {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    title!: string

    @Column({type: "text", default: ""})
    description!: string

    @Column({type: "enum", enum: EMPLOYMENT_TYPE, default: "full-time"})
    employmentType!: EmploymentType

    @Column()
    location!: string

    @Column({type: "enum", enum: CAREER_STATUS, default: "open"})
    status!: CareerStatus

    @Column()
    companyName!: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
