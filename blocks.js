var user = require('user'),
    app = require('expresslane').app;

app.get('/*', function(req, res, next) {
    if (user.permission(req, 'manage data')) {
      req.on('blocks:menu', function(blocks) {
          blocks.push({
              module: module.id,
              delta: 'user-logout',
              weight: 5,
              content: function() {
                  var locals = {};
                  locals.path = '/logout';
                  locals.title = 'logout';
                  return locals;
              }
          });
      });
    };
    next();
});
