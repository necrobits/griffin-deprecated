const Container = require('typedi').Container;

function email(string) {
    const re = new RegExp(Container.get('config').get('user.fields.email.regexMatch'));
    return re.test(string);
}

function string(s) {
    return true;
}

function date(d) {
    return true;
}

module.exports = {
    email,
    string,
    date,
};
