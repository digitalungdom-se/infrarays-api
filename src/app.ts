import dotenv from 'dotenv';

import loadServer from './loaders/server';

async function init(): Promise<any> {
    // Read .env file
    dotenv.config();

    const environment = process.env.NODE_ENV || 'development';

    // initiates server
    const app = await loadServer(environment);

    return app.listen(app.get('port'), function() {
    console.log(`Starting server in ${environment}. Listening on ${app.get('port')}`);

    if (environment === 'development') {
            console.log(`http://localhost:${app.get('port')}`);
        }
    });
}

module.exports = init();
