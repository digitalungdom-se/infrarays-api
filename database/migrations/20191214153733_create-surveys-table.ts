import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("surveys", function (table) {
    table.uuid("user_id").primary();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");

    table.string("city").notNullable();
    table.string("school").notNullable();
    table.string("gender").notNullable();

    table.specificType("application_portal", "smallint").unsigned().notNullable();
    table.specificType("application_process", "smallint").unsigned().notNullable();

    table.string("improvement").notNullable();
    table.string("informant").notNullable();

    table.dateTime("created").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("surveys");
}
