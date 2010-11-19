/**
 * @fileoverview
 *   Registers request handlers for user module upon inclusion.
 */

var app = require('expresslane').app,
    view = require('expresslane').view,
    user = require('./user'),
    forms = require('forms');

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
    if (!req.session.user && req.url != '/login') {
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
        console.log(res);
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
app.get('/login', function(req, res, next) {
    login_form_def(req, res, next);
});

/**
 * Handles post requests for login form
 */
app.post('/login', function(req, res, next) {
    login_form_def(req, res, next);
});

/**
 * Defines login form and hands it off to form handler.
 */
function login_form_def(req, res, next) {
    var form = new forms.Form({
        fields: function() {
            var field_def = {};

            field_def['name'] = forms.fields.string({
                label: 'Name',
                required: true,
                widget: forms.widgets.text({classes: ['text']})
            });
            field_def['password'] = forms.fields.password({
                label: 'Password',
                required: true,
                widget: forms.widgets.password({classes: ['text password']})
            });
            field_def['login'] = forms.fields.submit({
                value: 'Login',
                submit: function(form, req, res) {
                    for (var k in form.def.fields) {
                        if (k == 'name') {
                            name = form.def.fields[k].value;
                        }
                        else if (k == 'password') {
                            password = form.def.fields[k].value;
                        }
                    }
                    user.authenticate(name, password, req, function(err) {
                        if (err) {
                            form.def.fields[err.param].error = err.message;
                            res.render(view('content'), {
                                locals: {
                                    pageTitle: 'Login',
                                    title: 'Login',
                                    content: form.toHTML()
                                }
                            });
                        }
                        else {
                            res.redirect('/user');
                        }
                    });
                }
            });
            return field_def;
        },
        render: function(form, req, res) {
            res.render(view('content'), {
                locals: {
                    pageTitle: 'Login',
                    title: 'Login',
                    content: form.toHTML()
                }
            });
        }
    });
    // Delegate request handling to form.
    form.handle(req, res, next);
};

/**
 * Sign out a user.
 */
app.get('/logout', function(req, res, next) {
    // Destroy the user's session to log them out -
    // will be re-created on next request.
    if (req.session.user) {
        var user = req.session.user;
        req.session.destroy(function(){
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
