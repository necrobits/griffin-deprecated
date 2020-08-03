'use strict';
const Container = require('typedi').Container;
const _ = require('lodash');
/**
 * This is a layer above of User Service, providing data transformation functions
 */
const supportedMethods = {
    // Move this to an external package after having several methods
    // For now it's not worth the effort
    'jwt': '../sso-methods/jwt',
};

class AuthService {
    constructor() {
        this.userService = Container.get('service.user');
        this.clientService = Container.get('service.client');
    }

    async login(clientId, userId, password, method = 'jwt') {
        if (!_.has(supportedMethods, method)) {
            throw new Error('invalid_login_method');
        }
        // verify client
        if (clientId == null || userId == null) {
            throw new Error('invalid_login_data');
        }
        const client = await this.clientService.getClientById(clientId);
        if (client == null) {
            throw new Error('unauthorized');
        }
        // verify user credentials
        const profile = await this.userService.login(userId, password);

        // decide how to respond, depending on method
        const ssoMethod = require(supportedMethods[method]);
        return ssoMethod(client, profile);
    }
}

module.exports = AuthService;