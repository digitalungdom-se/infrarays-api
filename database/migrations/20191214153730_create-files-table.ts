import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('files', function(table) {
        table.specificType('id', 'char(16)').notNullable().unique().primary().index();

        table.specificType('user_id', 'char(16)').notNullable().index();
        table.foreign('user_id').references('users.id');

        table.string('type', 16).notNullable();

        table.dateTime('created').notNullable();
        table.string('file_name', 255).notNullable();

        table.binary('file').notNullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('files');
}
