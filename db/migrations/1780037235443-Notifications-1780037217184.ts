import { MigrationInterface, QueryRunner } from "typeorm";

export class Notifications17800372171841780037235443 implements MigrationInterface {
    name = 'Notifications17800372171841780037235443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notifiableId" character varying NOT NULL, "type" character varying NOT NULL, "data" jsonb NOT NULL, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
