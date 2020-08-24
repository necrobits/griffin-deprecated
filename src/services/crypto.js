const crypto = require('crypto');
const _ = require('lodash');
const Container = require('typedi').Container;

const defaultEncryptionConfig = {
    keySize: 1024,
    publicKey: {
        type: 'spki',
    },
    privateKey: {
        type: 'pkcs8'
    }
};

class CryptoService {
    constructor() {
        this.config = _.merge(defaultEncryptionConfig, Container.get('config').get('sso.encryption'));

        this.keyPairSettings = {
            modulusLength: this.config.keySize,
            publicKeyEncoding: {
                type: this.config.publicKey.type,
                format: 'pem'
            },
            privateKeyEncoding: {
                type: this.config.privateKey.type,
                format: 'pem',
            }
        };
        const keypair = crypto.generateKeyPairSync('rsa', this.keyPairSettings);
        this.currentPublicKey = keypair.publicKey;
        this.currentPrivateKey = keypair.privateKey;
    }

    getPublicKey() {
        return this.currentPublicKey;
    }

    getPrivateKey() {
        return this.currentPrivateKey;
    }
}

module.exports = CryptoService;