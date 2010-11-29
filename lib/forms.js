
var app = require('expresslane').app,
    user = require('./user'),
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
        submit: this.actions['login']
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
    var name = this.instance.name || null,
        password = this.instance.password || null;

    user.authenticate(name, password, req, function(err) {
        if (err) {
           this.errors[err.param] = err.message;
           next();
        }
        else {
            console.log('Logged in ' + name);
            this.success = function(req, res, next) { res.redirect('/user'); }
        }
    })
}; 
