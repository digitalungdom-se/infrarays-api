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
        'pool': { 'min': 0, 'max': 10 },
        'useNullAsDefault': true,

        'migrations': {
            'directory': '../../database/migrations/tmp',
        },
    },

    'production': {
        'client': 'pg',
        'connection': config.databaseURI,
        'pool': { 'min': 0, 'max': 10 },
        'useNullAsDefault': true,

        'migrations': {
            'directory': '../../database/migrations/tmp',
        },
    },

};

module.exports = knexConfig;
export default knexConfig;
