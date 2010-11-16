
# User

Rudimentary user system for Express + HBS.

- Form based user authentication requiring username and password.
- Varnish friendly session handling.
- Single user system.

## Installation

Add the following line to your ndistro file and rebuild:

    module developmentseed user

User assumes an express server module `server` available that exposes a
`users` object describing all allowed users (see usage)

    var users = require('server').set('settings')('users')

## Requirements

- Express http://expressjs.com/
- Forms https://github.com/developmentseed/forms
- Hbs (view engine) https://github.com/developmentseed/hbs

## Usage

### 1 Define users

    var settings = {
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
    require('server').set('settings', function(id) { return settings[id]; });

*Generating username and password*

1. Generate random salt (can be 'foo', better take sth better)
2. use md5 function in user to generate password: `md5('cleartextpw' + <salt>)`
3. add new user with key = name, name, salt and encrypted password.

### 2 Go

- Log in `login`
- Log out `logout`

## Todo

Plenty.
