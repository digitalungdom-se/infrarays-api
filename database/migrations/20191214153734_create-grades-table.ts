import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("grades", function (table) {
    table.uuid("id").primary();

    table.uuid("admin_id").notNullable().index();
    table.foreign("admin_id").references("users.id").onDelete("CASCADE");

    table.uuid("user_id").notNullable().index();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");

    table.specificType("cv", "smallint").unsigned().notNullable();
    table.specificType("coverLetter", "smallint").unsigned().notNullable();
    table.specificType("essay", "smallint").unsigned().notNullable();
    table.specificType("grade", "smallint").unsigned().notNullable();
    table.specificType("recommendation", "smallint").unsigned().notNullable();
    table.specificType("overall", "smallint").unsigned().notNullable();

    table.string("comment");

    table.unique(["admin_id", "user_id"]);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("grades");
}
