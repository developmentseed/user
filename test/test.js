/**
 * @fileoverview
 * Basic tests for document module.
 */

// Configure with local settings.
var app = require('expresslane').configure(__dirname);
require('../lib/user');

module.exports = {
    /**
     * Log in a user, log out a user. Access protected resources.
     */
    'authenticate': function(assert) {
        var headers = {
            'Content-Type' : 'application/x-www-form-urlencoded'
        };
        // /user is protected, resulting in a redirect to /login.
        assert.response(app, {
            url: '/user',
            method: 'GET',
            headers: headers
        }, {
            status: 302
        });

        // Checks if username is wrong user is redirected to login page.
        assert.response(app, {
           url: '/login',
           method: 'POST',
           headers: headers,
           data: 'name=wronguser&password=admin&login=Login'
        }, {
            body: /.*Invalid login credentials.*/,
            status: 200
        });

        // Checks if password is wrong user is redirected to login page.
        assert.response(app, {
           url: '/login',
           method: 'POST',
           headers: headers,
           data: 'name=admin&password=wrongpassword&login=Login'
        }, {
            body: /.*Invalid login credentials.*/,
            status: 200
        });

        // Login.
        assert.response(app, {
            url: '/login',
            method: 'POST',
            headers: headers,
            data: 'name=admin&password=admin&login=Login'
        }, function(res) {
            // Use cookie for subsequent responses.
            headers = {
                'Cookie': res.headers['set-cookie']
            };

            // Login should redirect to /user now.
            assert.response(app, {
                url: '/login',
                method: 'GET',
                headers: headers
            }, {
                status: 302
            });

            // User is accessible.
            assert.response(app, {
                url: '/user',
                method: 'GET',
                headers: headers
            }, {
                body: /.*admin.*/,
                status: 200
            });
        });
    }
}
