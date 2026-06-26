import { MigrationInterface, QueryRunner } from "typeorm";

export class Bookings17824748658991782474879518 implements MigrationInterface {
    name = 'Bookings17824748658991782474879518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "location" character varying NOT NULL, "inspectionDate" TIMESTAMP NOT NULL, "inspectionTime" TIMESTAMP NOT NULL, "message" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "booking"`);
    }

}
