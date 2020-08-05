const querystring = require('querystring');
const Container = require('typedi').Container;
const express = require('express');

class PublicUIController {
    constructor({loginUrl, signupUrl, assets, renderer}) {
        this.authService = Container.get('service.auth');
        this.userService = Container.get('service.user');
        this.loginUrl = loginUrl;
        this.signupUrl = signupUrl;
        this.assetsDir = assets;
        this.renderer = renderer;
        this.router = express.Router();
        this._setupRoutes();
    }

    async login(req, res) {
        try {
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type);
            applySSOResponse(res, req.body.type, ssoResponse);
        } catch (e) {
            this.renderer.renderLoginView(res, req.body.client_id, {error: e.error});
            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async register(req, res) {
        try {
            const user = await this.userService.register(req.body);
            res.status(201).json(user);
        } catch (e) {
            this.renderer.renderSignupView(res, req.body.client_id, {error: e});
            console.log("[ERROR] Message: ", e.message, e);

        }
    }

    _checkClientId(req, res, next) {
        if (!req.query.hasOwnProperty('client_id')) {
            res.status(404).end();
            return;
        }
        next();
    }

    _setupRoutes() {
        this.router.use('/assets', express.static(this.assetsDir));
        this.router.post(this.loginUrl, this.login.bind(this));
        this.router.post(this.signupUrl, this.register.bind(this));
        this.router.get(this.loginUrl, this._checkClientId, (req, res) => this.renderer.renderLoginView(res, req.query.client_id));
        this.router.get(this.signupUrl, this._checkClientId, (req, res) => this.renderer.renderSignupView(res, req.query.client_id));
    }
}

function applySSOResponse(res, loginType, ssoResponse) {
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
    const callbackData = {
        type: loginType,
        ...ssoResponse.callbackData
    };
    const callbackUrl = `${ssoResponse.callbackUrl}?${querystring.stringify(callbackData)}`;
    res.redirect(callbackUrl);
}

module.exports = PublicUIController;
