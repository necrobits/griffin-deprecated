const _ = require('lodash');

const ErrorToStatusCode = {
    'invalid_username_or_password': 401,
    'invalid_credential': 400,
    'invalid_client': 400,
    'invalid_login_method': 400,
    // Validator
    'missing_required_field': 400,
    'invalid_value_of_type': 400,
    'constraint_violation': 400,
    'unique_field_exists': 409,
    'invalid_email': 400,
    'invalid_username': 400,
};

class AppError extends Error {
    constructor(errorType, args) {
        super();
        this.error = errorType;
        this.args = args;
    }

    statusCode() {
        return _.get(ErrorToStatusCode, this.error, 500);
    }
}

module.exports = AppError;
