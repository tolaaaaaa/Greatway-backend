import { Property } from "src/modules/properties/entities/property.entity"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class PropertyFeature {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    description!: string 

    @Column({ nullable: true })
    icon!: string 

    @ManyToOne(() => Property, (property) => property.features, { onDelete: "CASCADE" })
    property!: Property
}