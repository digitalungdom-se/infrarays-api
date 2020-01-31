import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('grades', function (table) {
        table.specificType('id', 'char(16)').notNullable().unique().primary().index();

        table.specificType('admin_id', 'char(16)').notNullable();
        table.foreign('admin_id').references('admins.id');

        table.specificType('user_id', 'char(16)').notNullable();
        table.foreign('user_id').references('users.id');

        table.specificType('cv', 'smallint').unsigned().notNullable();
        table.specificType('coverLetter', 'smallint').unsigned().notNullable();
        table.specificType('essay', 'smallint').unsigned().notNullable();
        table.specificType('grade', 'smallint').unsigned().notNullable();
        table.specificType('recommendation', 'smallint').unsigned().notNullable();
        table.specificType('overall', 'smallint').unsigned().notNullable();

        table.string('comment');
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('grades');
}
