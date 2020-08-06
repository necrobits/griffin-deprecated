'use strict';
const Container = require('typedi').Container;
const _ = require('lodash');
const AppError = require('../errors');
const jwt = require('jsonwebtoken');
const sign = require('util').promisify(jwt.sign);
const verify = require('util').promisify(jwt.verify);


/**
 * This is a layer above of User Service, providing data transformation functions
 */
class AuthService {
    constructor() {
        this.userService = Container.get('service.user');
        this.clientService = Container.get('service.client');
        this.jwtConfig = Container.get('config').get('sso.token');
    }

    async makeSSOResponse(profile, client, hostname, redirectUrl) {
        console.log('hostname', hostname)
        if (redirectUrl == null) {
            redirectUrl = client.callback_url;
        }
        if (redirectUrl && !redirectUrl.startsWith(client.callback_url)) {
            throw new AppError('invalid_callback_url');
        }
        console.log('client pri', client.private_key)
        const token = await sign({
            ...profile,
        }, client.private_key, {
            algorithm: 'RS256',
            expiresIn: _.get(this.jwtConfig, 'expiration', 604800),
            issuer: _.get(this.jwtConfig, 'issuer', 'griffin'),
        });

        const callbackData = {
            token: token,
        };
        // TODO: replace with hostname
        if (client.callback_url === 'http://localhost:3000/sso/success') {
            callbackData.appUrl = client.app_url;
        }
        return {
            // For API
            body: {
                ...profile,
                token: token,
            },
            // For SSO UI
            cookies: {
                token: token
            },
            callbackUrl: redirectUrl,
            callbackData: callbackData,
        }
    }

    // TODO: replace "method" with response_type, state
    async login(clientId, userId, password, method = 'jwt', hostname, redirectUrl = null) {
        // verify client
        if (clientId == null) {
            throw new AppError('invalid_client');
        }
        const client = await this.clientService.getClientById(clientId);
        if (client == null) {
            throw new AppError('invalid_client');
        }
        // TODO : refactor this
        // allow custom redirect url, only if it's a sub-path of the registered url
        if (redirectUrl == null) {
            redirectUrl = client.callback_url;
        }
        if (!redirectUrl.startsWith(client.callback_url)) {
            throw new AppError('invalid_callback_url');
        }
        // verify user credentials
        if (userId == null || password == null) {
            throw new AppError('invalid_credential');
        }
        const profile = await this.userService.login(userId, password);

        return this.makeSSOResponse(profile, client, hostname, redirectUrl);
    }

    async verifyToken(clientId, userId, password) {
    }

    async verifyToken(token, client) {
        if(token == null || token.length < 10) {
            throw new AppError('token_not_found')
        }
        try {
            return await verify(token, client.public_key) != null;
        } catch (e) {
            throw new AppError('token_expired')
        }
    }
}

module.exports = AuthService;
