import knex from 'knex';
import config from './index';

interface IKnexConfig {
    development: object;
    production: object;
    [key: string]: object;
}

const knexConfig: IKnexConfig = {

    'development': {
        'client': 'pg',
        'connection': config.databaseURI,
        'pool': { 'max': 10, 'min': 0,
            'afterCreate'(connection: any, callback: any) {
                connection.query('SET TIME ZONE \'UTC\';', function(err: Error) {
                    callback(err, connection);
                    });
                },
            },
        'useNullAsDefault': true,

        'migrations': {
            'directory': '../../database/migrations/tmp',
        },
    },

    'production': {
        'client': 'pg',
        'connection': config.databaseURI,
        'pool': { 'max': 10, 'min': 0,
            'afterCreate'(connection: any, callback: any) {
                connection.query('SET TIME ZONE \'UTC\';', function(err: Error) {
                    callback(err, connection);
                    });
                },
    },
        'useNullAsDefault': true,

        'migrations': {
            'directory': '../../database/migrations/tmp',
        },
    },

};

module.exports = knexConfig;
export default knexConfig;
