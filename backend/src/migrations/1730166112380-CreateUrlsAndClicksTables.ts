import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUrlsAndClicksTables1730166112380
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA "app";`);

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.createTable(
      new Table({
        name: 'urls',
        schema: 'app',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'original_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'short_code',
            type: 'varchar',
            length: '6',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_urls_short_code',
            columnNames: ['short_code'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'clicks',
        schema: 'app',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'url_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'clicked_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'app.clicks',
      new TableForeignKey({
        columnNames: ['url_id'],
        referencedTableName: 'app.urls',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableClicks = await queryRunner.getTable('app.clicks');
    const foreignKey = tableClicks.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('url_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('app.clicks', foreignKey);
    }

    await queryRunner.dropTable('app.clicks');

    await queryRunner.dropTable('app.urls');

    // Opcionalmente, remover a extensão uuid-ossp
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
  }
}
