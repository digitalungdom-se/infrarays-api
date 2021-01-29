import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("grading_orders", function (table) {
    table.uuid("id").primary();

    table.uuid("admin_id").notNullable().index();
    table.foreign("admin_id").references("users.id").onDelete("CASCADE");

    table.uuid("applicant_id").notNullable();
    table.foreign("applicant_id").references("users.id").onDelete("CASCADE");

    table.specificType("order", "smallint").unsigned().notNullable();

    table.unique(["admin_id", "applicant_id"]);
    table.unique(["admin_id", "order"]);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("grading_orders");
}
