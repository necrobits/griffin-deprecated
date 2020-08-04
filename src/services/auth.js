'use strict';
const Container = require('typedi').Container;
const _ = require('lodash');
const AppError = require('../errors');
/**
 * This is a layer above of User Service, providing data transformation functions
 */
const supportedMethods = {
    'jwt': '../sso-methods/jwt',
};

class AuthService {
    constructor() {
        this.userService = Container.get('service.user');
        this.clientService = Container.get('service.client');
    }

    async login(clientId, userId, password, method = 'jwt', redirectUrl = null) {
        if (!_.has(supportedMethods, method)) {
            throw new AppError('invalid_login_method');
        }
        // verify client
        if (clientId == null) {
            throw new AppError('invalid_client');
        }
        const client = await this.clientService.getClientById(clientId);
        if (client == null) {
            throw new AppError('invalid_client');
        }
        // allow custom redirect url, only if it's a sub-path of the registered url
        if (redirectUrl == null) {
            redirectUrl = client.callback_url;
        } else if (!redirectUrl.startsWith(client.callback_url)) {
            throw new AppError('invalid_callback_url');
        }

        // verify user credentials
        if (userId == null || password == null) {
            throw new AppError('invalid_credential');
        }
        const profile = await this.userService.login(userId, password);

        // decide how to respond, depending on method
        const ssoMethod = require(supportedMethods[method]);
        return ssoMethod(client, profile, redirectUrl);
    }
}

module.exports = AuthService;
