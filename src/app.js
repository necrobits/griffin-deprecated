const Container = require('typedi').Container;
const {bootstrap, createExpressApp} = require('./bootstrap');

class GriffinServer {
    constructor() {
        this.initialized = false;
    }

    async init(configFile) {
        await bootstrap(configFile);
        this.initialized = true;
    }


    createClient(serviceName, appUrl, isTrusted, callbackUrl) {
        const clientService = Container.get('service.client');
        return clientService.register({
            service_name: serviceName,
            is_trusted: isTrusted,
            callback_url: callbackUrl,
            app_url: appUrl
        });
    }

    startWebserver() {
        if (!this.initialized) {
            throw new Error('Griffin must be initialized first.');
        }
        const app = createExpressApp();
        const port = Container.get('config').get('server.port');
        app.listen(port, () => {
            console.log("Griffin is running on port", port);
        });
    }
}

module.exports = GriffinServer;