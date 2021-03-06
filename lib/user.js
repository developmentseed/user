/**
 * @fileoverview
 *
 * User handling. Work in progress. Much of this code is inspired by or copied
 * from express' authentication example.
 */

var app = require('expresslane').app;

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


app.use(function(req, res, next) {
    // If user is given through command line arguments, authenticate on first
    // page request.
    if (userArgs) {
        authenticate(userArgs.name, userArgs.password, req, function(err, user) {
            userArgs = null;
            if (err) {
                console.log('Could not authenticate user - ' + err.message);
            }
            else {
                console.log('Authenticated ' + user.name);
            }
        });
    }
    next();
});

/**
 * User constructor.
 */
var User = function(name) {
    var users = require('expresslane').app.set('user').users;
    this.name = users[name].name || '';
    this.salt = users[name].salt || '';
    this.password = users[name].password || '';
    this.authenticated = false;
};

/**
 * Determine whether a user has a particular permission.
 *
 * In most cases, using the function permission(req, permission) will be more
 * convenient as it does not require to test for the presence of a user on the
 * session object.
 *
 * TODO Implement permission handling.
 */
User.prototype.permission = function(permission) {
    if (this.authenticated) {
        return true;
    }
    return false;
};

/**
 * Generates an md5 hash of a given string.
 */
var md5 = function(str) {
    return require('crypto').createHash('md5').update(str).digest('hex');
};

/**
 * Authenticates a user.
 *
 * @param name
 *   The user's name.
 * @param password
 *   The user's password.
 * @param request
 *   An HTTP request object.
 * @param callback
 *   Callback invoked after authentication. Receives an error object and a
 *   user object. The error contains a property 'param' indicating the
 *   parameter that caused the error ('name' or 'password');.
 */
var authenticate = function(name, password, request, callback) {
    var user = loadUser(name, password);
    if (user !== null) {
       request.session.regenerate(function() {
            user.authenticated = true;
            request.session.user = user;
            callback(null, user);
        });
    }
    else {
        var e = new Error('Incorrect login details');
        e.param = 'name';
        callback(e, null);
    }
};

/**
 * Validate a set of credentials.
 */
var loadUser = function(name, password) {
    var users = require('expresslane').app.set('user').users;
    var user = users[name] ? new User(name) : {};
    if (user.name) {
        if (md5(password + user.salt) == user.password) {
            return user;
        }
    }
    return null;
};


/**
 * Checks whether current user has given permission.
 *
 * @param req
 *   A request object.
 * @param permission
 *   A string that identifies a specific permission.
 *
 * @return
 *   true if the current user has the given permission, false otherwise.
 */
var permission = function(req, permission) {
    if (req.session.user && req.session.user.permission(permission)) {
        return true;
    }
    return false;
};

/**
 * Checks whether a user is authenticated.
 */
var authenticated = function(req) {
    if (req.session.user && req.session.user.authenticated) {
        return true;
    }
    return false;
};

/**
 * Middleware permission checker for express routes.
 *
 * @param perm
 *   A string that identifies a specific permission.
 */
var requirePermission = function(perm) {
    return function(req, res, next) {
        authenticated(req, perm)
            ? next()
            : next(new Error(403));
    }
};

/**
 * Export as Common.js module.
 */
module.exports = {
    'authenticate': authenticate,
    'authenticated': authenticated,
    'permission': permission,
    'loadUser' : loadUser,
    'requirePermission' : requirePermission,
    'forms' : require('./forms')
};
