/**
 * @fileoverview
 *
 * User handling. Work in progress. Much of this code is inspired by or copied
 * from express' authentication example.
 */

/**
 * User constructor.
 */
var User = function(name) {
    var users = require('expresslane').app.set('settings')('user').users;
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
}

/**
 * Generates an md5 hash of a given string.
 */
var md5 = function(str) {
    return require('crypto').createHash('md5').update(str).digest('hex');
}

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
 *   parameter that caused the error ('name' or 'password');
 */
var authenticate = function(name, password, request, callback) {
    var users = require('expresslane').app.set('settings')('user').users;
    var user = users[name] ? new User(name) : {};
    if (user.name) {
        if (md5(password + user.salt) == user.password) {
            request.session.regenerate(function() {
                user.authenticated = true;
                request.session.user = user;
                callback();
            });
        }
        else {
            var e = new Error('Wrong password');
            e.param = 'password';
            callback(e);
        }
    }
    else {
        var e = new Error('Unknown user');
        e.param = 'name';
        callback(e);
    }
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
}

/**
 * Middleware permission checker for express routes.
 *
 * @param perm
 *   A string that identifies a specific permission.
 */
var requirePermission = function(perm) {
    return function(req, res, next) {
        permission(req, perm)
            ? next()
            : res.send(403);
    }
}

/**
 * Export as Common.js module.
 */
module.exports = {
    'authenticate': authenticate,
    'authenticated': authenticated,
    'permission': permission,
    'requirePermission' : requirePermission,
};

// Registers request handlers.
// TODO Ideally, pages are a separate module from user but living in the
// same directory.
require('./pages');
