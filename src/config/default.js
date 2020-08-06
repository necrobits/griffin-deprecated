module.exports = {
    "user": {
        "disableUsername": false,
        "emailVerification": false,
        "fields": {
            "username": {
                "constraints": {
                    "minLength": 6,
                    "maxLength": 20,
                    "regexMatch": "^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$"
                }
            },
            "email": {
                "type": "email",
                "constraints": {
                    "minLength": 6,
                    "maxLength": 50,
                    "regexMatch": "^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
                }
            },
            "password": {
                "constraints": {
                    "minLength": 8,
                    "maxLength": 30,
                    "regexMatch": "^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\\-_\"{}()]).{8,50}$"
                }
            },
            "first_name": {
                "type": "string",
                "constraints": {
                    "minLength": 2,
                    "maxLength": 50
                }
            },
            "last_name": {
                "type": "string",
                "constraints": {
                    "minLength": 2,
                    "maxLength": 20
                }
            },
            "address": {
                "type": "string",
                "optional": true
            }
        }
    },
    "sso": {
        "loginUrl": "/sso/login",
        "logoutUrl": "/sso/logout",
        "signupUrl": "/sso/signup",
        "token": {
            "issuer": "neuralgi",
            "expiration": 604800,
            "required_fields": [
                "id",
                "username",
                "email"
            ]
        },
        "encryption": {
            "keySize": 1024,
            "publicKey": {
                "type": "spki"
            },
            "privateKey": {
                "type": "pkcs8"
            }
        },
        "client": {
            "id": {
                "salt": "griffinidsalt",
                "alphabet": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                "minLength": 10
            },
            "secret": {
                "salt": "griffinsecretsalt",
                "alphabet": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=-_/",
                "minLength": 30
            },
            "fields": {
                "is_trusted": {
                    "optional": false
                },
                "service_name": {
                    "optional": false,
                    "constraints": {
                        "minLength": 8,
                        "maxLength": 30
                    }
                },
                "app_url": {
                    "optional": false,
                    "constraints": {
                        "regexMatch": "https?:\\/\\/?[^\\s()<>]+(?:\\([\\w\\d]+\\)|([^[:punct:]\\s]|\\/?))"
                    }
                },
                "callback_url": {
                    "optional": true,
                    "constraints": {
                        "regexMatch": "https?:\\/\\/((www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)|localhost(:\\d+)?)"
                    }
                }
            }
        }
    },
    "adminDashboard": {
        "username": "admin",
        "password": "admin"
    }
};
