const crypto = require('crypto');
const forge = require('node-forge');
const generateKeyPairAsync = require('util').promisify(crypto.generateKeyPair);
const forgeGenerateKeyPairAsync = require('util').promisify(forge.pki.rsa.generateKeyPair);
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
        this.sysConfig = Container.get('config').get('system');

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

    generateCertificate() {
        const caKeyPem = fs.readFileSync(this.sysConfig.get('caKey'));
        const caCertPem = fs.readFileSync(this.sysConfig.get('caCert'));
        const caKey = forge.pki.privateKeyFromPem(caKeyPem);
        const caCert = forge.pki.certificateFromPem(caCertPem);

        const keyPair = forgeGenerateKeyPairAsync(2048);
        const cert = forge.pki.createCertificate();

        cert.publicKey = keyPair.publicKey;
        cert.serialNumber = '1';
        cert.validity.notBefore = new Date();
        cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

        const attrs = [{
            name: 'commonName',
            value: this.sysConfig.get('domain'),
        }, {
            name: 'organizationName',
            value: this.sysConfig.get('organization'),
        }];

        cert.setSubject(attrs);
        cert.setIssuer(caCert.subject.attributes);
        cert.sign(caKey, forge.md.sha256.create());
    }
}

module.exports = CryptoService;