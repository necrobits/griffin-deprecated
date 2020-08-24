'use strict';
const Container = require('typedi').Container;
const {Router} = require('express');
const _ = require('lodash');

class ApiController {
    constructor() {
        this.authService = Container.get('service.auth');
        this.cryptoService = Container.get('service.crypto');
        this.userService = Container.get('service.user');
        this.config = Container.get('config');
        this.router = Router();
        this._setupRoutes();
    }

    async login(req, res) {
        try {
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type, req.header.origin);
            res.json(ssoResponse.body);
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
            console.log("[ERROR] Message: ", e.error);
            res.status(e.statusCode()).json(e);
        }
    }

    async exchangeAccessToken(req, res) {

    }

    async refreshToken(req, res) {

    }

    async logout(req, res) {
        res.cookie('token', '');
        res.status(200).end();
    }

    async usernameCheck(req, res) {
        try {
            const exist = await this.userService.doesUsernameAlreadyExist(req.query.username);
            res.status(200).json({exist});
        } catch (e) {
            console.log("[ERROR] Message: ", e.error);
            res.status(e.statusCode()).json(e);
        }
    }


    async emailCheck(req, res) {
        try {
            const exist = await this.userService.doesEmailAlreadyExist(req.query.email);
            res.status(200).json({exist});
        } catch (e) {
            console.log("[ERROR] Message: ", e.error);
            res.status(e.statusCode()).json(e);
        }
    }

    showConfiguration(req,res){
        res.json({
            organization: this.config.get('system.organization'),
            endpoints: {
                login: this.config.get('sso.loginUrl'),
                logout: this.config.get('sso.logoutUrl'),
                signup: this.config.get('sso.signupUrl'),
            },
            publicKey: this.cryptoService.getPublicKey(),
        })
    }

    _setupRoutes() {
        this.router.post('/api/v1/auth', this.login.bind(this));
        this.router.post('/api/v1/register', this.register.bind(this));
        this.router.post('/api/v1/logout', this.logout.bind(this));
        this.router.get('/api/v1/usernamecheck', this.usernameCheck.bind(this));
        this.router.get('/api/v1/emailcheck', this.emailCheck.bind(this));
        this.router.get('/.well-known/griffin-config', this.showConfiguration.bind(this))

    }
}


module.exports = ApiController;
