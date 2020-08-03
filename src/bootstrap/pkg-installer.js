const exec = require('child_process').execSync;

function installPackages(pkgs) {
    for (let i = 0; i < pkgs.length; i++) {
        const pkgName = pkgs[i];
        console.log(`Installing package ${pkgName} [${i + 1}/${pkgs.length}]`);
        exec(`npm install ${pkgName}`);
    }
}

module.exports = installPackages;