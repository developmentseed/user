/**
 * @fileoverview
 *   Registers request handlers for user module upon inclusion.
 */

var app = require('expresslane').app,
    view = require('expresslane').view,
    user = require('user'),
    forms = require('forms');

/**
 * A user can be passed in as a command line argument, parse.
 */
var userArgs = null;

(function() {
    for (var i = 0; i < process.argv.length; i++) {
        if ('--user' == process.argv[i].substr(0, 6)) {
            var name = process.argv[i].substr(7);
        }
        if ('--password' == process.argv[i].substr(0, 10)) {
            var password = process.argv[i].substr(11);
        }
    }
    if (name && password) {
        userArgs = {name: name, password: password};
    }
})();

/**
 * Removes Set-Cookie header from response if user is not authenticated.
 *
 * Suppress Set-Cookie on all pages but the login page when a user is not
 * authenticated. This allows for aggressive caching with reverse-proxies.
 * Due to connect's session.js setting headers very late, we have no other
 * choice than using regex to remove Set-Cookie.
 *
 * @see sessionSetup() in session.js.
 *
 * Related issue: https://github.com/senchalabs/connect/issues/issue/153
 */
app.use(function(req, res, next) {
    // If user is given through command line arguments, authenticate on first
    // page request.
    if (userArgs) {
        user.authenticate(userArgs.name, userArgs.password, req, function(err, user) {
            userArgs = null;
            if (err) {
                console.log('Could not authenticate user - ' + err.message);
            }
            else {
                console.log('Authenticated ' + user.name);
            }
        });
    }
    else if (!req.session.user && req.url != '/login') {
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers) {
            res.writeHead = writeHead;
            var result = res.writeHead(status, headers);
            // Ouch.
            delete headers['Set-Cookie'];
            res._header = res._header.replace(/^Set-Cookie:.*?\r\n(.*)$/im, '$1');
            return result;
        };
    }
    next();
});

/**
 * Aggressive cache settings for authenticated users.
 */
app.use(function(req, res, next) {
    if (user.authenticated(req)) {
        // For HTTP 1.1 clients, post-check / pre-check for IE.
        res.headers['Cache-Control'] = 'no-cache, must-revalidate, post-check=0, pre-check=0';
        // Set expires date in past for HTTP1.0 clients.
        res.headers['Expires'] = 'Sun, 20 Jul 1969 20:17:39 GMT';
    }
    next();
});

/**
 * Handles get requests for login form
 */
app.get('/login', user.forms.login.load(), function(req, res, next) {
    if (user.authenticated(req)) {
        res.redirect('/user');
    }
    else {
        req.form.render(req, res, next);
    }
});

/**
 * Handles post requests for login form
 */
app.post('/login', user.forms.login.load(), function(req, res, next) {
    if (user.authenticated(req)) {
        res.redirect('/user');
    }
    else {
        req.form.process(req, res, next);
    }
});


/**
 * Sign out a user.
 */
app.get('/logout', function(req, res, next) {
    // Destroy the user's session to log them out -
    // will be re-created on next request.
    if (req.session.user) {
        var user = req.session.user;
        req.session.destroy(function() {
            console.log('Logged out ' + user.name);
            res.redirect('/login');
        });
    }
    else {
        next();
    }
});

/**
 * View a user.
 *
 * @todo Stop using the content.hbs template.
 */
app.get('/user', function(req, res, next) {
    if (req.session.user) {
        res.render(view('content'), {locals: {
            pageTitle: req.session.user.name,
            title: req.session.user.name,
            content: '<a href="/logout">Log out</a>'
        }});
    }
    else {
        res.redirect('/login');
    }
});