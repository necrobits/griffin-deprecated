const jwt = require('jsonwebtoken');
const sign = require('util').promisify(jwt.sign);
const Container = require('typedi').Container;
const _ = require('lodash');

module.exports = async (client, userProfile) => {
    const config = Container.get('config').get('jwt');
    const token = await sign({
        ...userProfile,
    }, client.private_key, {
        algorithm: 'RS256',
        expiresIn: _.get(config, 'expiration', 604800),
        issuer: _.get(config, 'issuer', 'griffin'),
    });
    return {
        redirect: client.callback_url + '?token=' + token
    }
};
