'use strict';
const Container = require('typedi').Container;
const _ = require('lodash');
const AppError = require('../errors');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const sign = require('util').promisify(jwt.sign);
const verifyJWT = require('util').promisify(jwt.verify);

/**
 * This is a layer above of User Service, providing data transformation functions
 */
class AuthService {
    constructor() {
        this.userService = Container.get('service.user');
        this.clientService = Container.get('service.client');
        this.cryptoService = Container.get('service.crypto');
        this.ssoConfig = Container.get('config').get('sso');
        this.jwtConfig = this.ssoConfig.token;
    }

    async makeSSOResponse(user, client, responseType, state, redirectUri) {
        redirectUri = this._conformRedirectURI(client, redirectUri);

        delete user['password'];
        delete user['created_at'];
        delete user['updated_at'];

        const token = await sign({
            ...user,
            oaud: client.client_id,
        }, this.cryptoService.getPrivateKey(), {
            algorithm: 'RS256',
            expiresIn: _.get(this.jwtConfig, 'expiration', 604800),
            issuer: _.get(this.jwtConfig, 'issuer', 'griffin'),
        });

        const callbackData = {
            token: token,
            state: state
        };

        if (redirectUri === this.ssoConfig.defaultCallback) {
            callbackData.appUrl = client.app_url;
        }
        let separator = '?';
        if (responseType === "token") {
            separator = '#';
        }
        const redirectTo = `${redirectUri}${separator}${querystring.stringify(callbackData)}`;

        return {
            // For API
            body: {
                ...user,
                token: token,
            },
            // For SSO UI
            cookies: {
                token: token
            },
            redirect: redirectTo,
        }
    }

    async login(client, username, password, responseType = "code", state = "", redirectUri = null) {
        // verify user credentials
        if (username == null || password == null) {
            throw new AppError('invalid_credential');
        }
        const profile = await this.userService.login(username, password);
        return this.makeSSOResponse(profile, client, responseType, state, redirectUri);
    }

    async authorize(client, token, responseType = "code", state = "", redirectUri = null) {
        const claims = await this._verifyToken(token);
        delete claims['sub'];
        delete claims['exp'];
        delete claims['aud'];
        delete claims['iat'];
        delete claims['iss'];
        delete claims['nbf'];
        delete claims['jti'];
        return this.makeSSOResponse(claims, client, responseType, state, redirectUri);
    }

    async _verifyToken(token) {
        const claims = jwt.decode(token);
        if (claims == null) {
            throw new AppError('unauthorized');
        }
        return verifyJWT(token, this.cryptoService.getPublicKey());
    }

    _conformRedirectURI(client, redirectUri) {
        if (redirectUri == null) {
            if (client.callback_url == null) {
                return this.ssoConfig.defaultCallback;
            }
            return client.callback_url;
        }

        if (!redirectUri.startsWith(client.callback_url)) {
            throw new AppError('invalid_callback_url');
        }
        return redirectUri;
    }
}

module.exports = AuthService;
