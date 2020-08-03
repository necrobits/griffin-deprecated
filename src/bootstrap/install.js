const Container = require('typedi/index').Container;
const _ = require('lodash');
const packageJson = require('../../package.json');
const installPackages = require('./pkg-installer');

const DBDialectPkgs = {
    sqlite: ['sqlite3'],
    postgres: ['pg', 'pg-hstore'],
    mariadb: ['mariadb'],
    mysql: ['mysql2'],
    mssql: ['tedious'],
};

function getDBDialectPkgs(config) {
    return _.get(DBDialectPkgs, config.get('db.dialect'), []);
}

function findAllRequiredPackages() {
    const config = Container.get('config');
    const packages = _.union(
        getDBDialectPkgs(config),
    );
    const installedPackages = _.keys(packageJson['dependencies']);

    return _.difference(packages, installedPackages);
}

async function installMissingDependencies() {
    const requiredPkgs = findAllRequiredPackages();
    if (requiredPkgs.length === 0) return;

    console.log("Installing missing packages...");
    installPackages(requiredPkgs);
    console.log("All missing packages are now installed.");
}

module.exports = installMissingDependencies;