const Container = require('typedi').Container;
const {validateFieldValue} = require('../validators');
const bcrypt = require('bcrypt');
const bcryptCompare = require('util').promisify(bcrypt.compare);
const bcryptHash = require('util').promisify(bcrypt.hash);

const _ = require('lodash');

const systemFieldConfigs = {
    username: {
        required: true,
        constraints: [
            {maxLength: 20},
            {minLength: 6},
        ]
    },
    email: {
        required: true,
        constraints: [
            {maxLength: 20},
            {minLength: 6},
            {isType: 'email'}
        ]
    },
    password: {
        required: true,
        constraints: [
            {maxLength: 50},
            {minLength: 8},
        ]
    }
};
const saltRounds = 10;

class UserService {
    constructor() {
        this.userRepo = Container.get('repo.user');
        this.usingEmail = Container.get('config').get('sso.usingEmail');
        this.fieldConfigs = Container.get('config').get('userFields');
        this.customFields = _.keys(this.fieldConfigs);
        this.systemFields = ['email', 'password'];
        if (!this.usingEmail) {
            this.systemFields.push('username');
        }
    }

    async register(rawUserData) {
        const userData = _.pick(rawUserData, _.union(this.customFields, this.systemFields));
        for (let f of this.customFields) {
            validateFieldValue(f, userData[f], this.fieldConfigs[f])
        }
        for (let f of this.systemFields) {
            validateFieldValue(f, userData[f], systemFieldConfigs[f]);
        }

        const passwordHash = await bcryptHash(userData.password, saltRounds);
        const user = {...userData, password: passwordHash};
        return this.userRepo.createUser(user);
    }


    async login(id, rawPassword) {
        let user;
        if (this.usingEmail) {
            user = await this.userRepo.findUserByEmail(id);
        } else {
            user = await this.userRepo.findUserByUsername(id);
        }
        if (user == null) {
            throw new Error('unauthorized');
        }
        console.log(rawPassword, user.password);
        const passwordMatched = await bcryptCompare(rawPassword, user.password);
        if (!passwordMatched) {
            throw new Error('unauthorized');
        }
        const {password, created_at, updated_at, ...profile} = user;
        return profile;
    }
}

module.exports = UserService;