import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("tokens", function (table) {
    table.string("value").primary();
    table.string("type").notNullable();
    table.dateTime("expires").nullable();

    table.uuid("user_id").notNullable().index();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("tokens");
}
