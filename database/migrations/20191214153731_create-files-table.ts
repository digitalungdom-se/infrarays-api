import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("files", function (table) {
    table.uuid("id").primary();

    table.uuid("user_id").notNullable().index();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");

    table.string("type").notNullable();

    table.dateTime("created").notNullable();
    table.string("name").notNullable();
    table.string("mime").notNullable();
    table.string("path").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("files");
}
