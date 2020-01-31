source ./.env

psql $DATABASE_URI -c 'DROP TABLE knex_migrations;DROP TABLE knex_migrations_lock;DROP TABLE files;DROP TABLE emails;DROP TABLE tokens;DROP TABLE surveys;DROP TABLE grades;DROP TABLE users;DROP TABLE admins;'
