import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('tokens', function(table) {
        table.string('id', 128).notNullable().unique().primary().index();
        table.string('type', 32).notNullable();

        table.specificType('user_id', 'char(16)').notNullable();
        table.foreign('user_id').references('users.id');
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('tokens');
}
