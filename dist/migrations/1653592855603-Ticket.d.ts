import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class Ticket1653592855603 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
