/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class HackMoveHcaAndSlackIdToUserprofile1778310639137 {
    name = 'HackMoveHcaAndSlackIdToUserprofile1778310639137'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_c318a8c9c26ba6d780cf6b1353"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_844098308ecb5168105cffa9ba"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hcaId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "slackId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "hcaId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "slackId" character varying(16)`);
        await queryRunner.query(`CREATE INDEX "IDX_8bc4e77626cced2e2cc0c1c1ca" ON "user_profile" ("hcaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cc5df58a539ebe6940154cd26" ON "user_profile" ("slackId") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_2cc5df58a539ebe6940154cd26"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8bc4e77626cced2e2cc0c1c1ca"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "slackId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "hcaId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "slackId" character varying(16)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hcaId" character varying(32)`);
        await queryRunner.query(`CREATE INDEX "IDX_844098308ecb5168105cffa9ba" ON "user" ("slackId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c318a8c9c26ba6d780cf6b1353" ON "user" ("hcaId") `);
    }
}
