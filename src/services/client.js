const Container = require('typedi').Container;
const _ = require('lodash');
const Hashids = require('hashids/cjs');
const {validateFieldValue} = require('../validators');
const AppError = require('../errors');

class ClientService {
    constructor() {
        this.clientRepo = Container.get('repo.client');
        const clientConfig = Container.get('config').get('sso.client');
        this.clientFieldConfigs = clientConfig.fields;
        this.idHasher = new Hashids(
            clientConfig.id.salt,
            clientConfig.id.minLength,
            clientConfig.id.alphabet,
        );
        this.secretHasher = new Hashids(
            clientConfig.secret.salt,
            clientConfig.secret.minLength,
            clientConfig.secret.alphabet,
        );
    }

    async register(rawClientData) {
        const clientData = _.pick(rawClientData, _.keys(this.clientFieldConfigs));
        for (let f of _.keys(this.clientFieldConfigs)) {
            validateFieldValue(f, clientData[f], this.clientFieldConfigs[f])
        }
        const clientId = this.idHasher.encode(new Date().getTime() + Math.round(Math.random() * 0xFFFF));
        const clientSecret = this.secretHasher.encode(new Date().getTime() + Math.round(Math.random() * 0xFFFFFFFF));

        const newClient = {
            client_id: clientId,
            client_secret: clientSecret,
            is_trusted: clientData.is_trusted,
            service_name: clientData.service_name,
            app_url: clientData.app_url,
            callback_url: clientData.callback_url,
        };
        return this.clientRepo.createClient(newClient);
    }

    async authenticate(clientId, clientSecret) {
        const client = await this.getClientById(clientId);
        if (client == null) {
            throw new AppError('unauthorized');
        }
        if (clientSecret !== client.client_secret) {
            throw new AppError('unauthorized');
        }
        return client;
    }

    getClientById(clientId) {
        return this.clientRepo.findClientById(clientId);
    }
}

module.exports = ClientService;
