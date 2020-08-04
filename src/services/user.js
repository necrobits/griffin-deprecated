const Container = require('typedi').Container;
const {validateFieldValue} = require('../validators');
const bcrypt = require('bcrypt');
const bcryptCompare = require('util').promisify(bcrypt.compare);
const bcryptHash = require('util').promisify(bcrypt.hash);
const AppError = require('../errors');

const _ = require('lodash');

const saltRounds = 10;

class UserService {
    constructor() {
        this.userRepo = Container.get('repo.user');
        this.usingEmail = Container.get('config').get('sso.usingEmail');
        this.fields = Container.get('config').get('allUserFields');
    }

    async register(rawUserData) {
        const userData = _.pick(rawUserData, _.keys(this.fields));

        for (let f of _.keys(this.fields)) {
            validateFieldValue(f, userData[f], this.fields[f])
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
            throw new AppError('invalid_username_or_password');
        }
        const passwordMatched = await bcryptCompare(rawPassword, user.password);
        if (!passwordMatched) {
            throw new AppError('invalid_username_or_password');
        }
        const {password, created_at, updated_at, ...profile} = user;
        return profile;
    }

}

module.exports = UserService;
