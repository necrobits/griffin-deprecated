'use strict';
const _ = require('lodash');
const loadConfigurations = require('./yaml');

const reservedFields = [
    'id',
    'username',
    'email',
    'password',
    'created_at',
    'updated_at'
];
const systemUserFields = {
    email: {
        constraints: {
            maxLength: 50,
            minLength: 6,
        },
        type: 'email'
    },
    password: {
        constraints: {
            maxLength: 50,
            minLength: 8
        },
    }
};
const usernameField = {
    constraints: {
        maxLength: 20,
        minLength: 6,
    }
};

class ConfigProvider {
    constructor(yamlFile) {
        const yamlConfig = loadConfigurations(yamlFile);
        const definedCustomFields = _.keys(yamlConfig['userFields']);

        if (_.intersection(definedCustomFields, reservedFields).length > 0) {
            throw new Error('userFields in the config contains prohibited field name');
        }
        let requiredUserFields = {};
        if (!_.get(yamlConfig, 'sso.usingEmails', false)) {
            requiredUserFields.username = usernameField;
        }
        requiredUserFields = {...requiredUserFields, ...systemUserFields};

        this.config = {
            ...yamlConfig,
            allUserFields: {...requiredUserFields, ...yamlConfig.userFields},
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
}

module.exports = ConfigProvider;
