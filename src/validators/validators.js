module.exports = {
    maxLength(string, val) {
        return string.length <= val;
    },
    minLength(string, val) {
        return string.length >= val;
    },

    after(date, val) {
        return date.getTime() >= val;
    },
    before(date, val) {
        return date.getTime() <= val;
    },
    regexMatch(string, regex) {
        const re = new RegExp(regex);
        console.log("regexMatch", re.test(string));
        return re.test(string);
    }
};
