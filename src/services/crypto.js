const crypto = require('crypto');
const generateKeyPairAsync = require('util').promisify(crypto.generateKeyPair);
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
        this.config = _.merge(defaultEncryptionConfig, Container.get('config').get('clientSettings.encryption'));
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
        }
    }

    generateKeyPair() {
        return generateKeyPairAsync('rsa', this.keyPairSettings);
    }
}

module.exports = CryptoService;