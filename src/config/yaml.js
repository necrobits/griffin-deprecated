'use strict';
const fs = require('fs');
const yaml = require('js-yaml');

module.exports = (yamlFile) => {
    try {
        let fileContents = fs.readFileSync(yamlFile, 'utf8');
        return yaml.safeLoad(fileContents);
    } catch (e) {
        throw new Error('Cannot load configuration file: ' + yamlFile);
    }
};