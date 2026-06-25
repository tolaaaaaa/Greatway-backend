import { MigrationInterface, QueryRunner } from "typeorm";

export class VerifyEmail17823728884711782372902741 implements MigrationInterface {
    name = 'VerifyEmail17823728884711782372902741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
    }

}
