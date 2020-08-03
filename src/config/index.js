'use strict;'
const _ = require('lodash');
const Container = require('typedi').Container;
const loadConfigurations = require('./yaml');

const reservedFields = [
    'id',
    'username',
    'email',
    'password',
    'created_at',
    'updated_at'
];

class ConfigProvider {
    constructor() {
        const yamlFile = Container.get('yaml_config_file');
        const yamlConfig = loadConfigurations(yamlFile);
        const definedCustomFields = _.keys(yamlConfig['userFields']);

        if (_.intersection(definedCustomFields, reservedFields).length > 0) {
            throw new Error('userFields in the config contains prohibited field name');
        }

        this.config = {
            ...yamlConfig,
            server: {
                host: process.env.HOST || 'localhost',
                port: process.env.PORT || 3000,
            },
            db: {
                dialect: process.env.DB_DIALECT || 'sqlite',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                user: process.env.DB_USER || 'admin',
                password: process.env.DB_PASS || 'password',
                name: process.env.DB_NAME || 'griffin',
            }
        }
    }

    get(path, defaultValue) {
        return _.get(this.config, path, defaultValue);
    }
};
module.exports = ConfigProvider;