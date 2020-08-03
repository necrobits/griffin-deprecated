const Container = require('typedi').Container;
const {toJSON} = require('./util');

class UserRepository {
    constructor() {
        this.db = Container.get('db');
        this.userModel = Container.get('db.model.user');
    }

    createUser(user) {
        return this.userModel.create(user).then(toJSON);
    }

    findUserByUsername(username) {
        return this.userModel.findOne({where: {username}}).then(toJSON);
    }

    findUserByEmail(email) {
        return this.userModel.findOne({where: {email}}).then(toJSON);
    }

    updateUser(user) {
        return this.userModel.update(user, {
            where: {
                email: user.email
            }
        })
    }
}

module.exports = UserRepository;