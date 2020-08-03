const Container = require('typedi').Container;
const {toJSON} = require('./util');

/**
 * Client are service providers
 */
class ClientRepository {
    constructor() {
        this.db = Container.get('db');
        this.clientModel = Container.get('db.model.client');
    }

    createClient(client) {
        return this.clientModel.create(client).then(toJSON);
    }

    findClientById(clientId) {
        return this.clientModel.findOne({where: {client_id: clientId}}).then(toJSON);
    }
}


module.exports = ClientRepository;