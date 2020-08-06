const Container = require('typedi').Container;
const express = require('express');
const path = require('path');
const _ = require('lodash');
const i18n = require('./ui/i18n');

const initializeDatabase = require('./database');
const initializeUI = require('./ui');
const installMissingDependencies = require('./bootstrap/install');

const ConfigProvider = require('./config');
const UserRepository = require('./repositories/user');
const ClientRepository = require('./repositories/client');
const UserService = require('./services/user');
const AuthService = require('./services/auth');
const ClientService = require('./services/client');
const CryptoService = require('./services/crypto');
const ApiController = require('./endpoints');
const PublicUIController = require('./endpoints/ui');

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

function initializeExpressApp(app) {
    const config = Container.get('config');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    const controller = new ApiController();
    app.use('/api/v1', controller.router);


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
        assets: path.join(__dirname, '../public'),
    });
    app.use(uiController.router);

}

async function test() {
    //await require('./database/seed').seedUsers();
    //await require('./database/seed').seedClients();
    //const user = await Container.get('repo.user').findUserByEmail('andytester@gmail.com');
}

module.exports = async () => {
    Container.set('config', new ConfigProvider('./griffin.yaml'));

    await installMissingDependencies();
    await initializeDatabase();
    await initializeDependencyInjection();

    const app = express();
    initializeExpressApp(app);
    await test();

    const port = Container.get('config').get('server.port');
    app.listen(port, () => {
        console.log("Server is running on port", port);
    });
};
