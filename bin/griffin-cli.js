#!/usr/bin/env node
const GriffinServer = require('../src/app');

async function registerClient(serviceName, args) {
    const griffin = new GriffinServer();
    await griffin.init('griffin.yaml');
    try {
        const client = await griffin.createClient(serviceName, args.appUrl, args.trusted, args.callbackUrl);
        console.log("================================================================");
        console.log("========================   CREDENTIAL   ========================");
        console.log("================================================================");
        console.log("Client ID:", client.client_id);
        console.log("Client secret:", client.client_secret);
        console.log("Service name:", client.service_name);
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
        console.log("Error:", e);
    }
}

async function startWebserver(args) {
    const griffin = new GriffinServer();
    await griffin.init(args.config);
    griffin.startWebserver();
}

async function start() {
    const program = require('commander');
    program
        .command('add-client <serviceName>')
        .description('Register a client manually')
        .option('-t --trusted', 'Register as a trusted client', false)
        .option('-u --callback-url [value]', 'Callback URL')
        .option('-a --app-url [value]', 'Application URL')
        .option('-c --config [value]', 'YAML config file')
        .action(registerClient);

    program
        .command('start')
        .description('Run web server')
        .option('-c --config [value]', 'YAML config file', 'griffin.yaml')
        .action(startWebserver);

    program.parse(process.argv);
}

start();
