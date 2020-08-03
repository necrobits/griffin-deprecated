'use strict';
const {Sequelize, DataTypes} = require('sequelize');
const _ = require('lodash');

const STR_TO_TYPE = {
    'string': DataTypes.STRING,
    'text': DataTypes.TEXT,
    'int': DataTypes.INTEGER,
    'int64': DataTypes.BIGINT,
    'float': DataTypes.FLOAT,
    'double': DataTypes.DOUBLE,
    'date': DataTypes.DATE,
};

const EMPTY_DEFAULT = {
    'string': '',
    'text': 0,
    'int': 0,
    'int64': 0,
    'float': 0,
    'double': 0,
    'date': Sequelize.NOW,
};

function mapDefaultValue(fieldConfig) {
    const type = fieldConfig['type'];
    if (type === 'date' && _.get(fieldConfig, 'default') === 'now') {
        return Sequelize.NOW;
    }
    return _.get(fieldConfig, 'default', EMPTY_DEFAULT[type]);
}

function configToModelField(fieldConfig) {
    if (!_.has(STR_TO_TYPE, fieldConfig['type'])) {
        throw new Error(`Type ${fieldConfig['type']} does not exist.`);
    }

    const field = {
        type: STR_TO_TYPE[fieldConfig['type']],
        allowNull: _.get(fieldConfig, 'optional', false),
        unique: _.get(fieldConfig, 'unique', false),
    };

    if (_.has(fieldConfig, 'default')) {
        field.defaultValue = mapDefaultValue(fieldConfig);
    }
    return field;
}

function constructUserModel(fields, loginWithEmail) {
    // Define fixed fieldConfig
    const model = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    };
    const indexes = [
        {
            fields: ['email'],
            unique: true
        },
    ];
    if (!loginWithEmail) {
        model.username = {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        };
        indexes.push({
            fields: ['username'],
            unique: true
        });
    }
    // Add custom fieldConfig from config
    _.forIn(fields, (config, fieldName) => {
        model[fieldName] = configToModelField(config);
    });


    return [model, indexes];
}

function constructClientModel() {
    const model = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        client_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        client_secret: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    };
    const indexes = [
        {
            fields: ['client_id'],
            unique: true
        }
    ];
    return [model, indexes];
}

module.exports = {
    constructUserModel,
    constructClientModel
};