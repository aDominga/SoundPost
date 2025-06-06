const {validationResult} = require('express-validator');
const User = require('../models/user');
const Item = require('../models/item');
const Offer = require('../models/offer');



//simply renders sell form
exports.new = (req, res) => {
    return res.render('./user/new');
};

//renders the login form
exports.getUserLogin = (req, res, next) => {
    return res.render('./user/login');
};



//login logic
exports.login = (req, res, next) => {

    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error => {
            req.flash('error', error.msg);

        });
        return res.redirect('back');
    }

    //grabs email and password from form
    let email = req.body.email;
    let password = req.body.password;

    //looks for email in db
    User.findOne({ email: email })
        .then(user => {
            if (!user) {

                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {

                //compares password
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            //if result is true then logs user in
                            req.session.user = user._id;
                            req.flash('success', 'You have successfully logged in');
                            res.redirect('/users/profile');
                        } else {
                            //else gives flash warning
                            req.flash('error', 'Incorrect password');
                            res.redirect('/users/login');
                        }
                    });

            }

        })
        .catch(err => next(err));
}


exports.profile = (req, res, next) => {
    //grabs session user id
    let id = req.session.user;
    //looks for items 
    Promise.all([User.findById(id), Item.find({ seller: id }), Offer.find({userId: id}).populate('itemId')])
        //grabs items and displays on profile page along wiht user info
        .then(results => {
            const [user, items, offers] = results;
            res.render('./user/profile', { user, items, offers })
        })
        .catch(err => next(err));
};


exports.create = (req, res, next) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    



    //grabs user info from the form
    let user = new User(req.body);
    //saves user into db
    user.save()
        .then(user => {
            req.flash('success', 'Registration Successful');
            res.redirect('/users/login');
        })
        //if issue with validation/schema throws a validation error 
        //along with flash
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }
            //if email has been used redirects back to signup page
            if (err.code === 11000) {
                req.flash('error', 'Email address has been used');
                return res.redirect('/users/new');
            }

            next(err);
        });

};


exports.logout = (req, res, next) => {
    //destroys session
    req.session.destroy(err => {
        //if there is an issue an error is thrown
        if (err)
            return next(err);
        else
            //else is redirected to landing page
            res.redirect('/');
    })
};