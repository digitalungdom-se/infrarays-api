import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("applications", function (table) {
    table.uuid("user_id").primary();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");

    table.date("birthdate").notNullable();

    table.boolean("finnish").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("applications");
}
