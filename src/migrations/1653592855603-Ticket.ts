import {MigrationInterface, QueryRunner} from 'typeorm';

export class Ticket1653592855603 implements MigrationInterface {
  name = 'Ticket1653592855603';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "ticket" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying NOT NULL, "category_name" character varying, "user_id" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_id" integer NOT NULL, "sender_id" character varying NOT NULL, "sender_name" character varying NOT NULL, "message" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_c7cbda9a7b72ee211da997772d" ON "message" ("ticket_id") `);
    await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_c7cbda9a7b72ee211da997772d4" FOREIGN KEY ("ticket_id") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_c7cbda9a7b72ee211da997772d4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c7cbda9a7b72ee211da997772d"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TABLE "ticket"`);
  }

}
