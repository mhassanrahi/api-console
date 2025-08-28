import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPinnedColumnToChatMessage1703123456789
  implements MigrationInterface
{
  name = 'AddPinnedColumnToChatMessage1703123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD "pinned" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chat_messages" DROP COLUMN "pinned"`);
  }
}
