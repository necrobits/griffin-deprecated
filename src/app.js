const Container = require('typedi').Container;
const express = require('express');
const path = require('path');
const _ = require('lodash');
const i18n = require('./i18n');

const ConfigProvider = require('./config');
const initializeDatabase = require('./database');
const UserRepository = require('./repositories/user');
const ClientRepository = require('./repositories/client');
const UserService = require('./services/user');
const AuthService = require('./services/auth');
const ClientService = require('./services/client');
const CryptoService = require('./services/crypto');
const ApiController = require('./endpoints');
const installMissingDependencies = require('./bootstrap/install');

function initializeDependencyInjection() {
    // Initialze the layers bottom-up
    // Repositories
    Container.set('repo.user', new UserRepository());
    Container.set('repo.client', new ClientRepository());
    // Services
    Container.set('service.crypto', new CryptoService());
    Container.set('service.user', new UserService());
    Container.set('service.client', new ClientService());
    Container.set('service.auth', new AuthService());
}

function initializeExpressApp(app) {
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    const controller = new ApiController();
    app.use('/api/v1', controller.router);


    app.use('/assets', express.static(path.join(__dirname, '../public')));
    app.use(i18n);
    const userFields = Container.get('config').get('allUserFields');
    const usingEmail = Container.get('config').get('sso.usingEmail');
    const userFieldsForView = [];
    for (let f of _.keys(userFields)) {
        const fieldConfig = userFields[f];
        const field = {
            key: f,
            optional: _.get(fieldConfig, 'optional', false),
            minLength: _.get(fieldConfig, 'constraints.minLength', 0),
            maxLength: _.get(fieldConfig, 'constraints.maxLength', 255),
        };
        const type = _.get(fieldConfig, 'type', 'string');
        if (f === 'password') {
            field.type = 'password';
        } else if (type === 'email') {
            field.type = 'email';
        } else {
            field.type = 'text';
        }
        userFieldsForView.push(field);
    }
    app.set('views', path.join(__dirname, 'ui/views'));
    app.set('view engine', 'ejs');
    app.get('/sso/login', function (req, res) {
        res.render('login', {
            userFields: userFieldsForView,
            usingEmail: usingEmail,
            client_id: req.query.client_id,
            title: `${res.__('login_page.title')} | ${res.__('brand')}`
        })
    });
    app.get('/sso/signup', function (req, res) {
        res.render('signup', {
            userFields: userFieldsForView,
            usingEmail: usingEmail,
            title: `${res.__('signup_page.title')} | ${res.__('brand')}`

        })
    });

}

async function test() {
    //await require('./database/seed').seedUsers();
    //await require('./database/seed').seedClients();
    //const user = await Container.get('repo.user').findUserByEmail('andytester@gmail.com');
}

module.exports = async () => {
    Container.set('config', new ConfigProvider('./griffin.yaml'));

    await installMissingDependencies();
    await initializeDatabase();
    await initializeDependencyInjection();

    const app = express();
    initializeExpressApp(app);
    await test();

    const port = Container.get('config').get('server.port');
    app.listen(port, () => {
        console.log("Server is running on port", port);
    });
};
