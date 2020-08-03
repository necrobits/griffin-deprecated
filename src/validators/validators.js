function isEmail(string) {
    const re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return re.test(string);
}

module.exports = {
    maxLength(string, val) {
        return string.length <= val;
    },
    minLength(string, val) {
        return string.length >= val;
    },
    isType(string, type) {
        if (type === 'email') {
            return isEmail(string);
        }
        return true;
    },
    after(date, val) {
        return date.getTime() >= val;
    },
    before(date, val) {
        return date.getTime() <= val;
    },
    regexMatch(string, regex) {
        const re = new RegExp(regex);
        return re.test(string);
    }
};