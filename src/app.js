const Container = require('typedi').Container;
const express = require('express');

const ConfigProvider = require('./config');
const initializeDatabase = require('./database');
const UserRepository = require('./repositories/user');
const ClientRepository = require('./repositories/client');
const UserService = require('./services/user');
const AuthService = require('./services/auth');
const CryptoService = require('./services/crypto');
const AppRouter = require('./api');
const installMissingDependencies = require('./bootstrap/install');

function initializeDependencyInjection() {
    // Initialze the layers bottom-up
    // Repositories
    Container.set('repo.user', new UserRepository());
    Container.set('repo.client', new ClientRepository());
    // Services
    Container.set('service.user', new UserService());
    Container.set('service.auth', new AuthService());
    Container.set('service.client', {});
    Container.set('service.crypto', new CryptoService());
}

function initializeExpressApp(app) {
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    const router = new AppRouter();
    router.setupRoutes(app);

}

async function test() {
    //await require('./database/seed').seedUsers();
    //const user = await Container.get('repo.user').findUserByEmail('andytester@gmail.com');
    Container.get('service.crypto').generateKeyPair();
}

module.exports = async () => {
    Container.set('config', new ConfigProvider('./griffin.yaml'));

    await installMissingDependencies();
    await initializeDatabase();
    await initializeDependencyInjection();

    const app = express();
    initializeExpressApp(app);
    await test();
    app.listen(config.get('server.port'), () => {
        console.log("Server is running on port", config.get('server.port'));
    });
};