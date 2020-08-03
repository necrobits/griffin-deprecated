const Container = require('typedi').Container;
const express = require('express');

const ConfigProvider = require('./config');
const initializeDatabase = require('./database');
const UserRepository = require('./repositories/user');
const ClientRepository = require('./repositories/client');
const UserService = require('./services/user');
const AuthService = require('./services/auth');
const ClientService = require('./services/client');
const CryptoService = require('./services/crypto');
const ApiController = require('./endpoints');
const installMissingDependencies = require('./bootstrap/install');

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
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    const controller = new ApiController();
    app.use('/api/v1', controller.router);

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