const _ = require('lodash');
const {Sequelize} = require('sequelize');
const Container = require('typedi').Container;
const {constructUserModel, constructClientModel} = require('./model');
const SQLITE_DB_FILE = './griffin.db';
const SUPPORTED_DIALECTS = ['mysql', 'mariadb', 'postgres', 'mssql', 'sqlite'];

async function initializeDatabase() {
    const config = Container.get('config');
    const dialect = config.get('db.dialect');
    if (!_.includes(SUPPORTED_DIALECTS, dialect)) {
        throw new Error('Unsupported dialect: ' + dialect);
    }

    let db;
    if (dialect === 'sqlite') {
        db = new Sequelize({
            dialect: 'sqlite',
            storage: './griffin.sqlite',
            logging: false
        });
    } else {
        db = new Sequelize(
            config.get('db.name'),
            config.get('db.user'),
            config.get('db.password'),
            {
                host: config.get('db.host'),
                port: config.get('db.port'),
                dialect: dialect,
            }
        );
    }
    const [userModelDef, userIndexes] = constructUserModel(config.get('userFields'), config.get('user.disableUsername', false));
    const [clientModelDef, clientIndexes] = constructClientModel();

    const UserModel = db.define('User', userModelDef, {
        indexes: userIndexes,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'users'
    });
    const ClientModel = db.define('Client', clientModelDef, {
        indexes: clientIndexes,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'clients',
    });
    await db.sync();

    Container.set('db', db);
    Container.set('db.model.user', UserModel);
    Container.set('db.model.client', ClientModel);
}

module.exports = initializeDatabase;