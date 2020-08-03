const _ = require('lodash');
const Validators = require('./validators');

function validateFieldValue(fieldName, value, fieldConfig) {
    const isOptional = _.get(fieldConfig, 'optional', false);
    const constraints = _.get(fieldConfig, 'constraints', []);

    if (value == null) {
        if (!isOptional) {
            throw new Error(`field_required: ${fieldName}`);
        }
        return true;
    }
    for (let c of constraints) {
        const constraintName = _.keys(c)[0].toLowerCase();
        const constraintVal = _.values(c)[0];
        if (!_.has(Validators, constraintName)) {
            continue;
        }
        let valid = Validators[constraintName](value, constraintVal);
        if (!valid) {
            throw new Error(`constraint_violation: ${constraintName} ${constraintVal}`);
        }
    }
}

module.exports = {
    validateFieldValue
};