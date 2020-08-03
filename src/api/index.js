const Container = require('typedi').Container;

class AppRouter {
    constructor() {
        this.authService = Container.get('service.auth');
    }

    async login(req, res) {
        try {
            const response = await this.authService.login(req.body.username, req.body.password);
            console.log("response", response);
            res.status(200).json(response);
        } catch (e) {
            console.log(e);
            res.status(401).json(e);
        }
    }

    setupRoutes(app) {
        app.post('/sso/auth', this.login.bind(this));
    }
}

module.exports = AppRouter;