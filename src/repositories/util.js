const _ = require('lodash');

/**
 * convert
 */
function toJSON(result){
    if (result === null){
        return null;
    }
    if (_.isArray(result)){
        return result.map(r => r.toJSON());
    }
    return result.toJSON();
}

module.exports = {
    toJSON
};