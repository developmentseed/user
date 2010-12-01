
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
        submit: function(req, res, next) { this.actions.login.apply(this, arguments); }
    })
};

userLoginForm.prototype.render = function(req, res, next) {
    res.render(view('content'), {
        locals: {
            pageTitle: 'Login',
            title: 'Login',
            content: this.toHTML()
        }
    });
};

userLoginForm.prototype.actions['login'] = function(req, res, next) {

    var that = this;

    var name = this.instance.name || null,
        password = this.instance.password || null;

    var user = require('./user');
    user.authenticate(name, password, req, function(err) {
        if (err) {
           that.errors[err.param] = err.message;
           next();
        }
        else {
            console.log('Logged in ' + name);
            res.redirect('/user'); 
        }
    })
};

module.exports = {
  'userLoginForm': userLoginForm,
}
