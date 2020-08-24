const Container = require('typedi').Container;
const UserRepository = require('../repositories/user');
const ClientRepository = require('../repositories/client');
const UserService = require('../services/user');
const AuthService = require('../services/auth');
const ClientService = require('../services/client');
const CryptoService = require('../services/crypto');
const ApiController = require('../endpoints');
const PublicUIController = require('../endpoints/ui');
const initializeDatabase = require('../database');
const initializeUI = require('../ui');
const installMissingDependencies = require('../bootstrap/install');
const ConfigProvider = require('../config');

const express = require('express');

const path = require('path');
const _ = require('lodash');

function initializeDependencyInjection() {
    // Initialze the layers bottom-up
    // Repositories
    Container.set('repo.user', new UserRepository());
    Container.set('repo.client', new ClientRepository());
    // Services
    Container.set('service.crypto', new CryptoService());
    Container.set('service.user', new UserService());
    Container.set('service.client', new ClientService());
    Container.set('service.auth', new AuthService());
}

function corsDelegate(origin, callback) {
    callback(null, true);
}

function createExpressApp() {
    const app = express();
    const config = Container.get('config');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const cors = require('cors');
    const controller = new ApiController();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());
    app.use(cors({origin: corsDelegate}));
    app.use(controller.router);

    const loginPath = config.get('sso.loginUrl');
    const signupPath = config.get('sso.signupUrl');
    const logoutPath = config.get('sso.logoutUrl');

    const viewRenderer = initializeUI(app, {
        loginPath: loginPath,
        signupPath: signupPath
    });

    const uiController = new PublicUIController({
            loginUrl: loginPath,
            signupUrl: signupPath,
            logoutUrl: logoutPath,
            renderer: viewRenderer,
            assets: path.join(__dirname, '../../public'),
        })
    ;
    app.use(uiController.router);
    return app;
}


async function bootstrap(configFile) {
    Container.set('config', new ConfigProvider(configFile));
    await installMissingDependencies();
    await initializeDatabase();
    await initializeDependencyInjection();
}

module.exports = {
    bootstrap,
    createExpressApp,
};