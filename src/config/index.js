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
            regexMatch: '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'
        },
        type: 'email',
    },
    password: {
        constraints: {
            maxLength: 50,
            minLength: 8,
            regexMatch: '^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\\-_"{}()]).{8,50}$'
        },
    }
};
const usernameField = {
    constraints: {
        maxLength: 20,
        minLength: 6,
        regexMatch: "^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$"
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
