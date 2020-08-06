'use strict';
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');

const defaultConfig = require('./default');

module.exports = (yamlFile) => {
    try {
        let fileContents = fs.readFileSync(yamlFile, 'utf8');
        const config = yaml.safeLoad(fileContents);
        return _.merge(defaultConfig, config);
    } catch (e) {
        throw new Error('Cannot load configuration file: ' + yamlFile);
    }
};