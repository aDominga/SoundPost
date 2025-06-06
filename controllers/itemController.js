const {validationResult} = require('express-validator');
const model = require('../models/item');
const Offer = require('../models/offer');

exports.index = (req, res, next) => {
    //This Grabs the value the was inserted in the search by the user
    let search = req.query.search;

    //This creates reggie which is a a $regex to find titles/details in the DB
    const reggie = new RegExp(search, 'i');

    //if something is in search
    if (search) {

        //this promise returns query
        model.find({

            //the $and checks for the $or (which checks for either title or details
            //and if it is active  
            $and: [
                {
                    $or: [
                        { title: { $regex: reggie } },
                        { details: { $regex: reggie } }
                    ]
                },
                // { active: true } this is messing things up possibly
            ]
        })

            //after it runs .then method  loading items on the index page
            .then(items => res.render('./item/index', { items }))

            //this handles the error and throws into the middle ware for error handling 
            .catch(err => next(err));

        //else statement runs 
    } else {
        //promise returns just normal index page 
        model.find({  })
            .sort({ price: 'asc' })
            .then(items => res.render('./item/index', { items }))
            .catch(err => next(err));
    }
};

exports.new = (req, res) => {
    //displays "new" page
    res.render('new');
};


exports.create = (req, res, next) => {






    //creates a new item
    let item = new model(req.body);
    //sets the seller to the user
    item.seller = req.session.user;
    //req file and mashes the file path together
    if (req.file) {
        item.images = '/images/' + req.file.filename;
    }



    //then saves it and loads the items page/Browsing page
    item.save()
        .then((item) => {
            console.log(item);
            req.flash('success', 'Item Successfully Created');
            res.redirect('/items');
        })
        

        //then catches any errors sets the status to 400 if it is a validation error
        //throws that error
        .catch(err => {
            err.status = 400;
            if (err.name === 'ValidationError') {
                
            }
            next(err);
        });
};


exports.show = (req, res, next) => {
    //grabs the items _id given by mongo
    let id = req.params.id;

    //if user types invalid id format in the engine search they receive
    //a 404 error and "invalid id" error
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    //this searches the model for any items that have matching ids in there schema
    model.findById(id).populate('seller', "firstName lastName")
        .then(item => {

            //if found it loads the item page within the item folder using values
            //from the item in the model
            if (item) {
                return res.render('./item/item', { item });
            } else {

                //else it throws a 404 error stating it can't find item with the id 
                let err = new Error('Cannot find an item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
};


exports.edit = (req, res, next) => {

    //grabs the items _id given by mongo
    let id = req.params.id;

    //this searches the model for any items that have matching ids in there schema
    model.findById(id)

        //loads the edit page with the items information prefilled
        .then(item => {
            return res.render('./item/edit', { item });
        })
        .catch(err => next(err));

};

exports.update = (req, res, next) => {
    //grabs info from the edit form
    let item = req.body;

    //mashes the file path so that the new image is displayed 
    if (req.file) {
        item.images = '/images/' + req.file.filename;
    }

    //grabs the items _id given by mongo
    let id = req.params.id;


    //WE USE "useFindAndModify: false" - so we don't use that method in mongodb driver
    //WHEN YOU CALL UPDATE METHODS REMEMBER TO ADD "runValidators: true" otherwise...
    // schema validators will not be used
    model.findByIdAndUpdate(id, item, { useFindAndModify: false, runValidators: true })

        //looks for id and changes the appropiate values 
        .then(item => {
            req.flash('success', 'Item Updated Successfully');
            res.redirect('/items/' + id);
        })
        .catch(err => {
            if (err.name === 'ValidationError')
                err.status = 400;
            next(err);
        });

};


exports.delete = (req, res, next) => {

    //grabs the items _id given by mongo
    let id = req.params.id;

    Offer.deleteMany({itemId: id})
    .then(offer => {
        req.flash('success', 'offers deleted successfully');
    })

    //deletes the item using _id
    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(item => {
            req.flash('success', 'Item Deleted Successfully');
            res.redirect('/items');
        })
        .catch(err => next(err));
};


