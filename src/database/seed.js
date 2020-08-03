const Container = require('typedi').Container;

function seedUsers() {
    return Container.get('service.user').register({
        'first_name': 'Andy',
        'last_name': 'Tran',
        'username': 'andytran11996',
        'password': '123123123',
        'email': 'andytester@gmail.com'
    });
}

async function seedClients() {
    const client = await Container.get('service.client').register({
        'service_name': 'TestApp',
        'is_trusted': true,
        'callback_url': 'http://localhost:3000/testcallback'
    });
    console.log("client added", client);
}

module.exports = {
    seedUsers, seedClients
};