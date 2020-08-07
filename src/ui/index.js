const path = require('path');
const Container = require('typedi').Container;
const i18n = require('./i18n');
const _ = require('lodash');

function initializeUI(app) {
    const config = Container.get('config');
    // translation
    const i18nConfig = config.get('translation');
    const i18nOpts = {
        defaultLocale: i18nConfig.defaultLocale,
        directory: i18nConfig.directory
    };
    app.use(i18n(i18nOpts));

    // views
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    const signupPath = config.get('sso.signupUrl');
    const loginPath = config.get('sso.loginUrl');
    const userFields = config.get('allUserFields');
    const usingEmail = config.get('user.disableUsername');
    const userFieldsForView = fieldViewsFromConfig(userFields);
    return {
        renderLoginView(res, clientId, responseType, extra = {}) {
            res.render('login', {
                userFields: userFieldsForView.filter(field => (field.key === 'email' && usingEmail) || (field.key === 'username' && !usingEmail) || field.key === 'password'),
                usingEmail: usingEmail,
                signupPath: `${signupPath}?client_id=${clientId}&response_type=${responseType}`,
                loginPath: `${loginPath}?client_id=${clientId}&response_type=${responseType}`,
                title: `${res.__('login_page.title')} | ${res.__('brand')}`,
                clientId: clientId,
                ...extra
            })
        },
        renderSignupView(res, clientId, responseType, extra = {}) {
            res.render('signup', {
                userFields: userFieldsForView,
                usingEmail: usingEmail,
                signupPath: `${signupPath}?client_id=${clientId}&response_type=${responseType}`,
                loginPath: `${loginPath}?client_id=${clientId}&response_type=${responseType}`,
                title: `${res.__('signup_page.title')} | ${res.__('brand')}`,
                clientId: clientId,
                ...extra,
            })
        },
        renderErrorView(res, error) {
            res.render('error', {
                error,
                title: `${res.__('error_title')} | ${res.__('brand')}`,
            });
        },
        renderLogoutView(res, error) {
            res.render('logout', {
                error,
                title: `${res.__('brand')}`,
            });
        },
        renderSuccessView(res, token) {
            res.render('success', {
                token: token,
                title: `${res.__('brand')}`,
            });
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
