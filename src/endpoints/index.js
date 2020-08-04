'use strict';
const Container = require('typedi').Container;
const {Router} = require('express');
const _ = require('lodash');

class ApiController {
    constructor() {
        this.authService = Container.get('service.auth');
        this.userService = Container.get('service.user');
        this.router = Router();
        this._setupRoutes();
    }

    async login(req, res) {
        try {
            console.log("Login type", req.body.type);
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type);
            applySSOResponse(res, ssoResponse);
        } catch (e) {
            console.log("[ERROR] Message: ", e.message);
            res.status(e.statusCode()).json(e);
        }
    }

    async register(req, res) {
        try {
            const user = await this.userService.register(req.body);
            res.status(201).json(user);
        } catch (e) {
            console.log("[ERROR] Message: ", e.message);
            res.status(500).json(e);
        }
    }


    _setupRoutes() {
        this.router.post('/auth', this.login.bind(this));
        this.router.post('/register', this.register.bind(this));
    }
}

function applySSOResponse(res, ssoResponse) {
    if (_.has(ssoResponse, 'headers')) {
        for (let h of _.keys(ssoResponse.headers)) {
            res.header(h, ssoResponse.headers[h]);
        }
    }
    if (_.has(ssoResponse, 'cookies')) {
        for (let h of _.keys(ssoResponse.cookies)) {
            res.cookie(h, ssoResponse.cookies[h]);
        }
    }
    if (_.has(ssoResponse, 'redirect')) {
        res.redirect(ssoResponse.redirect);
    }
    if (_.has(ssoResponse, 'body')) {
        res.json(ssoResponse.body);
    } else {
        res.end();
    }
}

module.exports = ApiController;
