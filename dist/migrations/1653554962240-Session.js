"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session1653554962240 = void 0;
class Session1653554962240 {
    async up(queryRunner) {
        await queryRunner.query('CREATE TABLE "postgress_sessions" (id varchar PRIMARY KEY, session varchar)');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE "postgress_sessions"');
    }
}
exports.Session1653554962240 = Session1653554962240;
//# sourceMappingURL=1653554962240-Session.js.map