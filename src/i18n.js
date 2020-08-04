const i18n = require('i18n');
const path = require('path');
const _ = require('lodash');
const locales = ['en', 'de', 'vi'];
i18n.configure({
    // setup some locales - other locales default to en silently
    locales: locales,
    objectNotation: true,
    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(__dirname, '../locales'),
    fallbacks: {'*': 'en'},
    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang',
});

module.exports = function (req, res, next) {
    i18n.init(req, res);
    if (req.query.lang && _.includes(locales, req.query.lang)) {
        res.setLocale(req.query.lang);
        res.cookie('lang', req.query.lang);
    }
    return next();
};
