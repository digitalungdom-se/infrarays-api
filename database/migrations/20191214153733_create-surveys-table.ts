import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('surveys', function (table) {
        table.specificType('id', 'char(16)').notNullable().unique().primary().index();

        table.specificType('user_id', 'char(16)').notNullable().unique().index();
        table.foreign('user_id').references('users.id');

        table.string('city', 256).notNullable();
        table.string('school', 256).notNullable();
        table.string('gender', 16).notNullable();

        table.specificType('application_portal', 'smallint').unsigned().notNullable();
        table.specificType('application_process', 'smallint').unsigned().notNullable();

        table.string('improvement', 10000).notNullable();
        table.string('informant', 10000).notNullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('surveys');
}
