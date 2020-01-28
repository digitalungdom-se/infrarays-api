import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('users', function(table) {
        table.specificType('id', 'char(16)').notNullable().unique().primary().index();

        table.string('email', 320).notNullable().unique().index();

        table.string('password', 128).notNullable();

        table.string('name', 256).notNullable();

        table.date('birthdate').notNullable();

        table.boolean('finnish').notNullable();

        table.specificType('recommendations', 'jsonb[]').notNullable();

        table.boolean('verified').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('users');
}
