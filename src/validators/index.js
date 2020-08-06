const _ = require('lodash');
const Validators = require('./validators');
const TypeChecker = require('./types');
const AppError = require('../errors');

function validateFieldValue(fieldName, value, fieldConfig) {
    const isOptional = _.get(fieldConfig, 'optional', false);
    const constraints = _.get(fieldConfig, 'constraints', {});
    const type = _.get(fieldConfig, 'type', 'string');
    if (value == null) {
        if (!isOptional) {
            throw new AppError(`missing_required_field`, fieldName);
        }
        return true;
    }
    if (!_.has(TypeChecker, type.toLowerCase()) || !TypeChecker[type.toLowerCase()](value)) {
        throw new AppError(`invalid_value_of_type`, {type, value})
    }

    for (let c of _.keys(constraints)) {

        const constraintName = c;
        const constraintVal = constraints[c];

        if (!_.has(Validators, constraintName)) {
            continue;
        }

        let valid = Validators[constraintName](value, constraintVal);

        if (!valid) {
            throw new AppError(`constraint_violation`, {
                field: fieldName,
                constraint: constraintName,
                constraintValue: constraintVal,
                value: value
            });
        }
    }

}

module.exports = {
    validateFieldValue
};
