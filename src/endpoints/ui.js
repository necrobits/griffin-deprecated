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
        this._setupRoutes.bind(this)();
    }

    // TODO: invalidate token after logout
    loginView(req, res) {
        const client = req.ssoClient;

        this.renderer.renderLoginView(res, req.query.client_id, req.ssoParams.response_type, {clientAppUrl: client.app_url});
    }

    successView(req, res) {
        this.renderer.renderSuccessView(res, req.cookies['token']);
    }

    async login(req, res) {
        try {
            const ssoResponse = await this.authService.login(req.ssoClient, req.body.username, req.body.password, req.ssoParams.response_type, req.ssoParams.state, req.ssoParams.redirect_uri);
            applySSOResponse(res, ssoResponse);
        } catch (e) {
            this.renderer.renderLoginView(res, req.body.client_id, req.ssoParams.response_type, {
                error: e.error,
                clientAppUrl: req.ssoClient.app_url
            });
            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async register(req, res) {
        try {
            // TODO: refactor this
            const user = await this.userService.register(req.body);
            const ssoResponse = await this.authService.makeSSOResponse(user, req.ssoClient, req.ssoParams.response_type, req.ssoParams.state, req.ssoParams.redirect_uri);
            applySSOResponse(res, ssoResponse);

        } catch (e) {
            this.renderer.renderSignupView(res, req.body.client_id, req.ssoParams.response_type, {
                error: e,
                clientAppUrl: req.ssoClient.app_url
            });

            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async authorize(req, res) {
        const token = req.cookies.token;
        try {
            const ssoResponse = await this.authService.authorize(req.ssoClient, token, req.ssoParams.response_type, req.ssoParams.state, req.ssoParams.redirect_uri);
            applySSOResponse(res, ssoResponse);

        } catch (e) {
            this.renderer.renderLoginView(res, req.query.client_id, req.ssoParams.response_type, {clientAppUrl: client.app_url});
            console.log("[ERROR] Message: ", e.message, e);
        }
    }

    async _requireClient(req, res, next) {
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

    async _checkToken(req, res, next) {
        if (req.cookies['token']) {
            try {
                const token = req.cookies['token'];
                const ssoResponse = await this.authService.authorize(req.ssoClient, token, req.ssoParams.response_type, req.ssoParams.state, req.ssoParams.redirect_uri);
                applySSOResponse(res, ssoResponse);
            } catch (e) {
                console.log(e);
                res.redirect(this.loginUrl);
            }
        } else {
            next();
        }
    }

    _requireParams(req, res, next) {
        const requiredKeys = ['response_type'];
        const ssoParams = _.merge(req.query, req.body);
        if (_.intersection(requiredKeys, _.keys(ssoParams)).length < requiredKeys.length) {
            this.renderer.renderErrorView(res, 'invalid_request');
        } else {
            req.ssoParams = ssoParams;
            next();
        }
    }


    async logout(req, res) {
        res.clearCookie('token');
        this.renderer.renderLogoutView(res)
    }

    _setupRoutes() {
        const requireClient = this._requireClient.bind(this);
        const requireParams = this._requireParams.bind(this);
        const checkToken = this._checkToken.bind(this);
        this.router.use('/assets', express.static(this.assetsDir));
        this.router.post(this.loginUrl, requireClient, requireParams, this.login.bind(this));
        this.router.post(this.signupUrl, requireClient, requireParams, this.register.bind(this));
        this.router.get(this.loginUrl, requireClient, requireParams, checkToken, this.loginView.bind(this));
        this.router.get(this.signupUrl, requireClient, requireParams, checkToken, (req, res) => this.renderer.renderSignupView(res, req.query.client_id));
        this.router.get(this.logoutUrl, this.logout.bind(this));
        this.router.get('/sso/success', this.successView.bind(this));
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
    if (ssoResponse.hasOwnProperty("redirect")) {
        res.redirect(ssoResponse.redirect);
    } else {
        res.end();
    }
}

module.exports = PublicUIController;
