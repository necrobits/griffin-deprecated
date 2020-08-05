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
            const ssoResponse = await this.authService.login(req.body.client_id, req.body.username, req.body.password, req.body.type);
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
            console.log("[ERROR] Message: ", e);
            res.status(e.statusCode()).json(e);
        }
    }

    async usernameCheck(req,res){
        const exist = await this.userService.doesUsernameAlreadyExist(req.query.n);
        res.status(200).json({ok: !exist});
    }

    async emailCheck(req,res){
        const exist = await this.userService.doesEmailAlreadyExist(req.query.n);
        res.status(200).json({ok: !exist});
    }


    _setupRoutes() {
        this.router.post('/auth', this.login.bind(this));
        this.router.post('/register', this.register.bind(this));
        this.router.get('/usernamecheck', this.usernameCheck.bind(this));
        this.router.get('/emailcheck', this.emailCheck.bind(this));
    }
}


module.exports = ApiController;
