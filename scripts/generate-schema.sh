source ./.env

node_modules/schemats/bin/schemats.js generate -c $DATABASE_URI -o src/types/database.d.ts
