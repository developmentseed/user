var user = require('user'),
    expresslane = require('expresslane');


expresslane.addMenuItem({
    filter: function(req, res) {
        return true;
        //return user.permission(req, 'manage data');
    },
    href: 'logout',
    title: 'logout',
    class: ['right'],
    weight: 1 
});

