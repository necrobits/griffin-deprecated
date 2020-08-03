'use strict';
const Container = require('typedi').Container;

/**
 * This is a layer above of User Service, providing data transformation functions
 */
class AuthService {
    constructor() {
        this.userService = Container.get('service.user');
    }

    async login(id, password) {
        console.log("authlogin")
        const profile = await this.userService.login(id, password);
        return {
            token: 'fake_token',
            profile: profile
        }
    }

}
module.exports = AuthService;