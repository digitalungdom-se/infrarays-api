tsc src/configs/knexfile

mkdir database/migrations/tmp

for file in database/migrations/*.ts
do
    tsc $file --outDir database/migrations/tmp/
done

./node_modules/.bin/knex migrate:latest --knexfile src/configs/knexfile.js

rm -rf database/migrations/tmp
rm src/configs/knexfile.js
rm src/configs/index.js
