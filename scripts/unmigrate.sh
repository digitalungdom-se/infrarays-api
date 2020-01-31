source ./.env

psql $DATABASE_URI -c 'DROP TABLE knex_migrations;DROP TABLE knex_migrations_lock;DROP TABLE files; DROP TABLE admins;DROP TABLE emails;DROP TABLE tokens;DROP TABLE surveys;DROP TABLE users;'
