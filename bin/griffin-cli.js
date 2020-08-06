#!/usr/bin/env node

const Container = require('typedi').Container;
const ConfigProvider = require('../src/config');
const initializeDatabase = require('../src/database');
const UserRepository = require('../src/repositories/user');
const ClientRepository = require('../src/repositories/client');
const UserService = require('../src/services/user');
const AuthService = require('../src/services/auth');
const ClientService = require('../src/services/client');
const CryptoService = require('../src/services/crypto');
const installMissingDependencies = require('../src/bootstrap/install');

function initializeDependencyInjection() {
    Container.set('repo.user', new UserRepository());
    Container.set('repo.client', new ClientRepository());
    Container.set('service.crypto', new CryptoService());
    Container.set('service.user', new UserService());
    Container.set('service.client', new ClientService());
    Container.set('service.auth', new AuthService());
}

async function registerClient(serviceName, args) {
    const clientService = Container.get('service.client');
    try {
        const client = await clientService.register({
            service_name: serviceName,
            is_trusted: args.trusted,
            callback_url: args.callbackUrl,
            app_url: args.appUrl,
            ...args
        });
        console.log(`${serviceName} registered`);
        console.log("================================================================");
        console.log("========================   CREDENTIAL   ========================");
        console.log("================================================================");
        console.log("Client ID:", client.client_id);
        console.log("Client secret:", client.client_secret);
        console.log("App URL:", client.app_url);
        console.log("Callback URL:", client.callback_url);
        console.log('');
        console.log("================================================================");
        console.log("========================    KEY PAIR    ========================");
        console.log("================================================================");
        console.log(client.public_key);
        console.log(client.private_key);
        console.log("================================================================");
        console.log("================================================================");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function start() {
    Container.set('config', new ConfigProvider('./griffin.yaml'));
    await installMissingDependencies();
    await initializeDatabase();
    await initializeDependencyInjection();
    const program = require('commander');

    program
        .command('add-client <serviceName>')
        .description('Register a client manually')
        .option('-t --trusted', 'Register as a trusted client', false)
        .option('-c --callback-url [value]', 'Callback URL')
        .option('-a --app-url [value]', 'Application URL')
        .action(registerClient);

    program.parse(process.argv);
}

start();