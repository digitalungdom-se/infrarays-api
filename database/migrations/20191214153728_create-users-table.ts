import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("users", function (table) {
    table.uuid("id").primary();

    table.string("email").notNullable().unique().index();

    table.string("first_name").notNullable();
    table.string("last_name").notNullable();

    table.string("type").notNullable();

    table.boolean("verified").notNullable().defaultTo(false);

    table.dateTime("created").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("users");
}
