const Container = require('typedi').Container;
const {validateFieldValue} = require('../validators');
const bcrypt = require('bcrypt');
const bcryptCompare = require('util').promisify(bcrypt.compare);
const bcryptHash = require('util').promisify(bcrypt.hash);
const AppError = require('../errors');
const _ = require('lodash');
const TypeChecker = require('../validators/types');
const Validators = require('../validators/validators');

const saltRounds = 10;

class UserService {
    constructor() {
        this.userRepo = Container.get('repo.user');
        this.usingEmail = Container.get('config').get('user.disableUsername');
        this.fields = Container.get('config').get('allUserFields');
    }

    async register(rawUserData) {
        const userData = _.pick(rawUserData, _.keys(this.fields));
        userData.email = userData.email.toLowerCase();
        userData.username = userData.username.toLowerCase();

        for (let f of _.keys(this.fields)) {
            validateFieldValue(f, userData[f], this.fields[f]);
        }
        const passwordHash = await bcryptHash(userData.password, saltRounds);
        const user = {...userData, password: passwordHash};
        try {
            return await this.userRepo.createUser(user);
        } catch (e) {
            if (e.hasOwnProperty('errors') && e.hasOwnProperty('fields')) {
                throw new AppError('unique_field_exists', {field: e.fields[0], value: user[e.fields[0]]})
            } else {
                throw e;
            }
        }

    }

    async login(id, rawPassword) {
        let user;
        if (this.usingEmail) {
            user = await this.userRepo.findUserByEmail(id.toLowerCase());
        } else {
            user = await this.userRepo.findUserByUsername(id.toLowerCase());
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

    doesUsernameAlreadyExist(username) {
        if (username == null || !Validators.regexMatch(username, this.fields.username.constraints.regexMatch)) {
            throw  new AppError(('invalid_username'));
        }
        return this.userRepo.findUserByUsername(username).then(r => r != null);
    }

    doesEmailAlreadyExist(email) {
        if (email == null || !TypeChecker.email(email)) {
            throw new AppError('invalid_email');
        }
        return this.userRepo.findUserByEmail(email).then(r => r != null);
    }


}

module.exports = UserService;
