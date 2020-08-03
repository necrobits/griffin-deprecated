const Container = require('typedi').Container;

async function seedUsers() {
    return await Container.get('service.user').register({
        'first_name': 'Andy',
        'last_name': 'Tran',
        'username': 'andytran11996',
        'password': '123123123',
        'email': 'andytester@gmail.com'
    });
}

module.exports = {
    seedUsers
};