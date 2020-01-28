import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('emails', function(table) {
        table.string('type',32).notNullable().unique().primary().index();
        table.text('content').notNullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('emails');
}
