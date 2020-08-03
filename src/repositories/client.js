const Container = require('typedi').Container;

/**
 * Client are service providers
 */
class ClientRepository {
    constructor(){
        this.db = Container.get('db');
    }
}


module.exports = ClientRepository;