import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingInspectionTime17825445583001782544566159 implements MigrationInterface {
    name = 'BookingInspectionTime17825445583001782544566159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "inspectionTime"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "inspectionTime" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "inspectionTime"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "inspectionTime" TIMESTAMP NOT NULL`);
    }

}
