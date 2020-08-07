const i18n = require('i18n');
const _ = require('lodash');
const fs = require('fs');


function listLocalesInDirectory(dirPath) {
    const localeList = [];
    const files = fs.readdirSync(dirPath);
    for (let f of files) {
        if (f.endsWith('.json')) {
            localeList.push(f.split('.')[0]);
        }
    }
    return localeList;
}


module.exports = function (config) {
    const localesPath = config.directory;
    const locales = listLocalesInDirectory(localesPath);
    i18n.configure({
        locales: locales,
        objectNotation: true,
        directory: config.directory,
        fallbacks: {'*': config.defaultLocale},
        defaultLocale: config.defaultLocale,
        cookie: 'lang',
    });
    return function (req, res, next) {
        i18n.init(req, res);
        if (req.query.lang && _.includes(locales, req.query.lang)) {
            res.setLocale(req.query.lang);
            res.cookie('lang', req.query.lang);
        }
        return next();
    };
};
