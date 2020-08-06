// TODO: List all default configuration here
module.exports = {
    "user": {
        "disableUsername": false,
        "emailVerification": false,
        "fields": {
            "username": {
                "constraints": {
                    "minLength": 6,
                    "maxLength": 20
                }
            },
            "password": {
                "constraints": {
                    "minLength": 8,
                    "maxLength": 30
                }
            },
        }
    },
    "sso": {
        "loginUrl": "/sso/login",
        "logoutUrl": "/sso/logout",
        "signupUrl": "/sso/signup",
        "token": {
            "issuer": "neuralgi",
            "expiration": 604800
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
            }
        }
    },
    "adminDashboard": {
        "username": "admin",
        "password": "admin"
    }
};