import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncFix17777240067541777724017538 implements MigrationInterface {
    name = 'SyncFix17777240067541777724017538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin', 'super_admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" text NOT NULL DEFAULT '', "email" character varying NOT NULL, "phoneNumber" text NOT NULL DEFAULT '', "password" character varying NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'inactive', "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5945fec365d6b346513fa528fad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."property_status_enum" AS ENUM('listed', 'unlisted', 'sold')`);
        await queryRunner.query(`CREATE TABLE "property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "salesPrice" character varying NOT NULL, "location" character varying NOT NULL, "status" "public"."property_status_enum" NOT NULL DEFAULT 'unlisted', "description" text NOT NULL, "imageUrls" text NOT NULL DEFAULT '[]', "videoUrl" text NOT NULL DEFAULT '', "saleSupportAvatar" text NOT NULL DEFAULT '', "supportInCharge" character varying NOT NULL, "whatsAppNumber" character varying NOT NULL, "altNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "property_feature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "icon" character varying, "propertyId" uuid, CONSTRAINT "PK_3ba973220760cfcffe572d8c816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gallery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65d7a1ef91ddafb3e7071b188a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."career_employmenttype_enum" AS ENUM('full-time', 'contract', 'part-time', 'internship')`);
        await queryRunner.query(`CREATE TYPE "public"."career_status_enum" AS ENUM('open', 'closed')`);
        await queryRunner.query(`CREATE TABLE "career" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "employmentType" "public"."career_employmenttype_enum" NOT NULL DEFAULT 'full-time', "location" character varying NOT NULL, "status" "public"."career_status_enum" NOT NULL DEFAULT 'open', "companyName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f694c0aa9babcae2c4ad61c7d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "property_feature" ADD CONSTRAINT "FK_84efff4da327672f4b44fc65288" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_feature" DROP CONSTRAINT "FK_84efff4da327672f4b44fc65288"`);
        await queryRunner.query(`DROP TABLE "career"`);
        await queryRunner.query(`DROP TYPE "public"."career_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."career_employmenttype_enum"`);
        await queryRunner.query(`DROP TABLE "gallery"`);
        await queryRunner.query(`DROP TABLE "property_feature"`);
        await queryRunner.query(`DROP TABLE "property"`);
        await queryRunner.query(`DROP TYPE "public"."property_status_enum"`);
        await queryRunner.query(`DROP TABLE "trail"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
