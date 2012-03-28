var user = require('user'),
    expresslane = require('expresslane');


expresslane.addMenuItem({
    filter: function(req, res) {
        return user.authenticated(req);
    },
    href: '/logout',
    title: 'logout',
    class: ['right', 'last'],
    weight: -10 // right aligned means lighter is more to the right.
});

