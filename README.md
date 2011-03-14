# User

Rudimentary user system for Express + HBS.

- Form based user authentication requiring username and password.
- Varnish friendly session handling.
- Single user system.

## Installation

Add the following line to your ndistro file and rebuild:

    module developmentseed user

User assumes that expresslane module is available and exposes a
`users` object describing all allowed users (see usage)

    var users = require('expresslane').app.set('settings')('user').users

## Requirements

- Express http://expressjs.com/
- Forms https://github.com/developmentseed/forms
- Hbs (view engine) https://github.com/developmentseed/hbs

## Usage

### 1 Configure session handling

    app.use(express.cookieDecoder());
    app.use(express.session({
        secret: require('crypto').createHash('md5').update(Math.random()).digest('hex')
        // For tests set reapInterval to -1
        , store: new express.session.MemoryStore({ reapInterval: -1 })
    }));

### 2 Define users

    // settings.js
    module.exports = {
        user: {
            users: {
                admin: {
                    name: 'admin',
                    salt: '722a058557b48a64343',
                    password: 'qbtNjBqo34N2UkvpgtEMFwAA3434f691'
                }
            }
        }
    };

*Generating username and password*

1. Generate random salt (can be 'foo', better take sth better)
2. use md5 function in user to generate password: `md5('cleartextpw' + <salt>)`
3. add new user with key = name, name, salt and encrypted password.

### 3 Go

Log in

    /login

Log out

    /logout

Log in from command line

    node myapp.js --user="Buster Keaton" --password=porkpie

## Testing

    cd user/test
    ndistro
    tests

## Todo

Plenty.
