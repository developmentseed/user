
var app = require('expresslane').app,
    user = require('./user'),
    view = require('expresslane').view,
    forms = require('forms');

var userLoginForm = forms.createForm();

userLoginForm.prototype.fields = {
    name: forms.fields.string({
        label: 'Name',
        required: true,
        widget: forms.widgets.text({classes: ['text']})
    }),
    password: forms.fields.password({
        label: 'Password',
        required: true,
        widget: forms.widgets.password({classes: ['text password']})
    }),
    login: forms.fields.submit({
        value: 'Login',
        submit: function (req, res, next) {
          var user = require('./user');
          var name = this.instance.name || null;
          var password = this.instance.password || null;
          user.authenticate(name, password, req, function(err) {
              if (!err) {
                  console.log('Logged in ' + name);
                  req.form.success = function(req, res, next) {
                      res.redirect('/user');
                  }
              }
          })

        }
    })
};

userLoginForm.on('validate', function(req, res, next) {

    console.log('validate');
    user = require('./user');
    if (user.loadUser(this.instance.name, this.instance.password) === null) {
        this.errors['name'] = true;
        this.errors['password'] = true;
        this.messages.errors = 'Invalid login credentials';
    }
})


userLoginForm.on('success', function(req, res, next) {
  console.log('success');
  this.render(req,res,next);
    //res.redirect('/user');
})


userLoginForm.prototype.render = function(req, res, next) {
    res.render(view('content'), {
        locals: {
            pageTitle: 'Login',
            title: 'Login',
            content: this.toHTML()
        }
    });
};

module.exports = {
  'userLoginForm': userLoginForm,
}
