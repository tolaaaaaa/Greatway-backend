import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingsUpdate17824756655161782475680010 implements MigrationInterface {
    name = 'BookingsUpdate17824756655161782475680010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'confirmed', 'declined')`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "declineReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "declineReason"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    }

}
