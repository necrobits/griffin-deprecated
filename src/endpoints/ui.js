const querystring = require('querystring');
const Container = require('typedi').Container;
const express = require('express');
const _ = require('lodash');

class PublicUIController {
    constructor({loginUrl, signupUrl, logoutUrl, assets, renderer}) {
        this.authService = Container.get('service.auth');
        this.userService = Container.get('service.user');
        this.clientService = Container.get('service.client');
        this.loginUrl = loginUrl;
        this.logoutUrl = logoutUrl;
        this.signupUrl = signupUrl;
        this.assetsDir = assets;
        this.renderer = renderer;
        this.router = express.Router();
        this._setupRoutes();
    }

    // TODO: invalidate token after logout
    async loginView(req, res) {
        const client = req.ssoClient;
        if (req.cookies['token']) {
            const callbackData = {
                token: req.cookies['token']
            };
            if (client.callback_url === 'http://localhost:3000/sso/success') {
                callbackData.appUrl = client.app_url;
            }
            res.redirect(`${client.callback_url}#${querystring.stringify(callbackData)}`);
            res.end();
            return;
        }
        this.renderer.renderLoginView(res, req.query.client_id, {clientAppUrl: client.app_url});
    }

    async successView(req, res) {
        this.renderer.renderSuccessView(res, req.cookies['token']);
    }

    async login(req, res) {
        try {
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type);
            applySSOResponse(res, req.body.type, ssoResponse);
        } catch (e) {
            this.renderer.renderLoginView(res, req.body.client_id, {
                error: e.error,
                clientAppUrl: req.ssoClient.app_url
            });
            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async register(req, res) {
        try {
            // TODO: refactor this
            const {updated_at, created_at, password, ...user} = await this.userService.register(req.body);
            const ssoResponse = await this.authService.makeSSOResponse(user, req.ssoClient);
            applySSOResponse(res, 'jwt', ssoResponse);

        } catch (e) {
            this.renderer.renderSignupView(res, req.body.client_id, {error: e});

            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async _checkClientId(req, res, next) {
        if (!req.query.hasOwnProperty('client_id') && !req.body.hasOwnProperty('client_id')) {
            this.renderer.renderErrorView(res, 'invalid_client');
            return;
        }
        const client = await this.clientService.getClientById(req.query.client_id || req.body.client_id);
        if (client == null) {
            this.renderer.renderErrorView(res, 'invalid_client');
            return;
        }
        req.ssoClient = client;
        next();
    }


    async logout(req, res) {
        res.cookie('token', '');
        this.renderer.renderLogoutView(res)
    }

    _setupRoutes() {
        this.router.use('/assets', express.static(this.assetsDir));
        this.router.post(this.loginUrl, this._checkClientId.bind(this), this.login.bind(this));
        this.router.post(this.signupUrl, this._checkClientId.bind(this), this.register.bind(this));
        this.router.get(this.loginUrl, this._checkClientId.bind(this), this.loginView.bind(this));
        this.router.get(this.signupUrl, this._checkClientId.bind(this), (req, res) => this.renderer.renderSignupView(res, req.query.client_id));
        this.router.get(this.logoutUrl, this.logout.bind(this));
        this.router.get('/sso/success', this.successView.bind(this));
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
    console.log("CALLBACK", callbackData);
    const callbackUrl = `${ssoResponse.callbackUrl}#${querystring.stringify(callbackData)}`;
    res.redirect(callbackUrl);
}

module.exports = PublicUIController;
