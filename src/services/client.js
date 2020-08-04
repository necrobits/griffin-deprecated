const Container = require('typedi').Container;
const _ = require('lodash');
const Hashids = require('hashids/cjs');
const {validateFieldValue} = require('../validators');
const AppError = require('../errors');
const clientFieldConfigs = {
    is_trusted: {
        optional: false,
    },
    service_name: {
        constraints: [
            {minLength: 8},
            {maxLength: 30},
        ]
    },
    callback_url: {
        optional: true,
        constraints: [
            {regexMatch: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)'},
        ]
    }
};
const clientIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const clientIdMinLength = 10;
const clientSecretAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=-_/';
const clientSecretMinLength = 30;

class ClientService {
    constructor() {
        this.clientRepo = Container.get('repo.client');
        this.cryptoService = Container.get('service.crypto');
        const idSalt = Container.get('config').get('clientSettings.clientIdSalt');
        const secretSalt = Container.get('config').get('clientSettings.clientSecretSalt');
        this.idHasher = new Hashids(
            idSalt,
            clientIdMinLength,
            clientIdAlphabet,
        );
        this.secretHasher = new Hashids(
            secretSalt,
            clientSecretMinLength,
            clientSecretAlphabet
        );
    }

    async register(rawClientData) {
        const clientData = _.pick(rawClientData, _.keys(clientFieldConfigs));
        for (let f of _.keys(clientFieldConfigs)) {
            validateFieldValue(f, clientData[f], clientFieldConfigs[f])
        }
        const {publicKey, privateKey} = await this.cryptoService.generateKeyPair();
        const clientId = this.idHasher.encode(new Date().getTime() + Math.round(Math.random() * 0xFFFF));
        const clientSecret = this.secretHasher.encode(new Date().getTime() + Math.round(Math.random() * 0xFFFFFFFF));
        const newClient = {
            client_id: clientId,
            client_secret: clientSecret,
            private_key: privateKey,
            public_key: publicKey,
            is_trusted: clientData.is_trusted,
            service_name: clientData.service_name,
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
