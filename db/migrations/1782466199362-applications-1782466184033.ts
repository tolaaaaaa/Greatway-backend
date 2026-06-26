import { MigrationInterface, QueryRunner } from "typeorm";

export class Applications17824661840331782466199362 implements MigrationInterface {
    name = 'Applications17824661840331782466199362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "application" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "resume" character varying NOT NULL, "coverLetter" text, "jobId" uuid NOT NULL, "startDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_dbc0341504212f830211b69ba0c" FOREIGN KEY ("jobId") REFERENCES "career"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_dbc0341504212f830211b69ba0c"`);
        await queryRunner.query(`DROP TABLE "application"`);
    }

}
