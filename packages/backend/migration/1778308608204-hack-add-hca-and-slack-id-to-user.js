/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class HackAddHcaAndSlackIdToUser1778308608204 {
    name = 'HackAddHcaAndSlackIdToUser1778308608204'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "hcaId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "slackId" character varying(16)`);
        await queryRunner.query(`CREATE INDEX "IDX_c318a8c9c26ba6d780cf6b1353" ON "user" ("hcaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_844098308ecb5168105cffa9ba" ON "user" ("slackId") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_844098308ecb5168105cffa9ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c318a8c9c26ba6d780cf6b1353"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "slackId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hcaId"`);
    }
}
