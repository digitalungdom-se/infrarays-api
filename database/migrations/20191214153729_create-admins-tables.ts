import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('admins', function(table) {
        table.specificType('id', 'char(16)').notNullable().unique().primary().index();

        table.string('email', 320).notNullable().unique().index();

        table.binary('password', 72).notNullable();

        table.string('name', 64).notNullable();

        table.boolean('super_admin');
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('admins');
}
