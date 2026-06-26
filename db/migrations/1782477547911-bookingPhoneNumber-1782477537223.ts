import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingPhoneNumber17824775372231782477547911 implements MigrationInterface {
    name = 'BookingPhoneNumber17824775372231782477547911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" ADD "phoneNumber" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "phoneNumber"`);
    }

}
