'use strict';
const Container = require('typedi').Container;
const {Router} = require('express');
const _ = require('lodash');

class ApiController {
    constructor() {
        this.authService = Container.get('service.auth');
        this.router = Router();
        this._setupRoutes();
    }

    async login(req, res) {
        try {
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type);
            applySSOResponse(res, ssoResponse);
        } catch (e) {
            console.log("[ERROR] Message: ", e.message);
            res.status(401).json(e);
        }
    }


    _setupRoutes() {
        this.router.post('/auth', this.login.bind(this));
    }
}

function applySSOResponse(res, ssoResponse) {
    if (_.has(ssoResponse, 'headers')) {
        for (let h in _.keys(ssoResponse.headers)) {
            res.header(h, ssoResponse.headers[h]);
        }
    }
    if (_.has(ssoResponse, 'cookies')) {
        for (let h in _.keys(ssoResponse.cookies)) {
            res.cookie(h, ssoResponse.cookies[h]);
        }
    }
    if (_.has(ssoResponse, 'body')) {
        res.json(ssoResponse.body);
    } else {
        res.end();
    }
}

module.exports = ApiController;