const path = require('path');
const Container = require('typedi').Container;
const i18n = require('./i18n');
const _ = require('lodash');

const defaultAssetsDir = path.join(__dirname, '../public');
const defaultLoginPath = '/sso/login';
const defaultSignupPath = '/sso/signup';
const defaultConfig = {
    assets: defaultAssetsDir,
    loginPath: defaultLoginPath,
    signupPath: defaultSignupPath
};

function initializeUI(app, config = defaultConfig) {
    app.use(i18n);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    const userFields = Container.get('config').get('allUserFields');
    const usingEmail = Container.get('config').get('sso.usingEmail');
    const userFieldsForView = fieldViewsFromConfig(userFields);
    return {
        renderLoginView(res, clientId, extra = {}) {
            res.render('login', {
                userFields: userFieldsForView.filter(field => (field.key === 'email' && usingEmail) || (field.key === 'username' && !usingEmail) || field.key === 'password'),
                usingEmail: usingEmail,
                signupPath: `${config.signupPath}?client_id=${clientId}`,
                loginPath: `${config.loginPath}?client_id=${clientId}`,
                title: `${res.__('login_page.title')} | ${res.__('brand')}`,
                clientId: clientId,
                ...extra
            })
        },
        renderSignupView(res, clientId, extra = {}) {

            res.render('signup', {
                userFields: userFieldsForView,
                usingEmail: usingEmail,
                signupPath: `${config.signupPath}?client_id=${clientId}`,
                loginPath: `${config.loginPath}?client_id=${clientId}`,
                title: `${res.__('signup_page.title')} | ${res.__('brand')}`,
                clientId: clientId,
                ...extra,
            })
        }
    };
}

function fieldViewsFromConfig(userFields) {
    const userFieldsForView = [];
    for (let f of _.keys(userFields)) {
        const fieldConfig = userFields[f];
        const field = {
            key: f,
            optional: _.get(fieldConfig, 'optional', false),
            minLength: _.get(fieldConfig, 'constraints.minLength', 0),
            maxLength: _.get(fieldConfig, 'constraints.maxLength', 255),
        };
        const regexMatch = _.get(fieldConfig, 'constraints.regexMatch');
        if (regexMatch) {
            field.pattern = regexMatch;
        }
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
    return userFieldsForView;
}

module.exports = initializeUI;
