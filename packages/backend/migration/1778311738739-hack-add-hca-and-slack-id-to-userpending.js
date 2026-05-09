/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class HackAddHcaAndSlackIdToUserpending1778311738739 {
    name = 'HackAddHcaAndSlackIdToUserpending1778311738739'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_pending" ADD "hcaId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "user_pending" ADD "slackId" character varying(16)`);
        await queryRunner.query(`CREATE INDEX "IDX_5b26bdb50f23d01414e1963bc5" ON "user_pending" ("hcaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_82d59fb263e6366fe50d391d79" ON "user_pending" ("slackId") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_82d59fb263e6366fe50d391d79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b26bdb50f23d01414e1963bc5"`);
        await queryRunner.query(`ALTER TABLE "user_pending" DROP COLUMN "slackId"`);
        await queryRunner.query(`ALTER TABLE "user_pending" DROP COLUMN "hcaId"`);
    }
}
