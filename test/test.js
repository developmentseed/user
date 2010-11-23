require.paths.unshift(__dirname + '/../modules', __dirname + '/../lib/node', __dirname, __dirname + '/../lib');
require.paths.unshift(__dirname + '/../modules/forms/lib'); // Hack for forms...

var app = require('expresslane').configure(__dirname);
require('user');

// Generates a random number that is used to
// ensure the entry created is unique.
var random = Math.floor(Math.random()*10000);

module.exports = {
    /**
     * Basic node stack test
     */
    'stack test': function(assert) {
        // Check that node stack is setup properly.
        assert.response(app, {
            url: '/'
        }, {
            status: 200
        });
    },
    /**
     * Logs in as a user attempts to create a new
     * entry, view that entry then delete that entry.
     */
    'entry test': function(assert) {
        assert.response(app, {
            url: '/login',
            method: 'POST',
            data: 'name=admin&password=admin&login=Login'
        }, function(res) {
            // Stores the cookie header into reusable variable.
            var cookie = res.headers['set-cookie'];

            // Checks if username is wrong user is redirected to login page.
            assert.response(app, {
               url: '/login',
               method: 'POST',
               data: 'name=wronguser&password=admin&login=Login'
            }, {
                body: /.*Unknown user.*/
            });

            // Checks if password is wrong user is redirected to login page.
            assert.response(app, {
               url: '/login',
               method: 'POST',
               data: 'name=admin&password=wrongpassword&login=Login'
            }, {
                body: /.*Wrong password.*/
            });
        });
    }
}
