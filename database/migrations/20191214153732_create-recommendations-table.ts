import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("recommendations", function (table) {
    table.uuid("id").primary();
    table.string("code").notNullable().index().unique();

    table.uuid("applicant_id").notNullable();
    table.foreign("applicant_id").references("users.id").onDelete("CASCADE");

    table.string("email").notNullable();

    table.dateTime("last_sent").notNullable();

    table.dateTime("received").nullable();

    table.uuid("file_id").nullable();
    table.foreign("file_id").references("files.id").onDelete("CASCADE");

    table.specificType("index", "smallint").unsigned().notNullable();

    table.unique(["applicant_id", "email"]);
    table.unique(["applicant_id", "index"]);
    table.index(["applicant_id", "index"]);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable("recommendations");
}
