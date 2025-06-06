const Item = require('../models/item');

//Checks if user is guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated 
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};



//if user types invalid id format in the engine search they receive
//a 400 error and an "invalid id" error
exports.isSeller = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)

        //checks if the user wanting to edit the item is the seller
        .then(item => {
            if (item) {
                if (item.seller == req.session.user) {
                    return next();
                } else {
                    //if user is not the seller a 401 error is thrown
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                //or if id can't be found a 404 error is thrown
                let err = new Error('Cannot find an item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};


// if user types invalid id format in the engine search they receive 
// a 400 error and an "invalid id" error
// isUnAuth checks if the user is unauthorized to make offers on their own post 
exports.isUnAuth = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)

        //checks if the user wanting to make an offer to the item is the seller
        .then(item => {
            if (item) {
                if (item.seller == req.session.user) {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);                
            }
        }

        })
        .catch(err => next(err));
};