import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("grades", function (table) {
    table.uuid("id").primary();

    table.uuid("admin_id").notNullable().index();
    table.foreign("admin_id").references("users.id").onDelete("CASCADE");

    table.uuid("applicant_id").notNullable().index();
    table.foreign("applicant_id").references("users.id").onDelete("CASCADE");

    table.specificType("cv", "smallint").unsigned().notNullable();
    table.specificType("cover_letter", "smallint").unsigned().notNullable();
    table.specificType("essays", "smallint").unsigned().notNullable();
    table.specificType("grades", "smallint").unsigned().notNullable();
    table.specificType("recommendations", "smallint").unsigned().notNullable();
    table.specificType("overall", "smallint").unsigned().notNullable();

    table.string("comment", 8192).nullable();

    table.unique(["admin_id", "applicant_id"]);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("grades");
}
