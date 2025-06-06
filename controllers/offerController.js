const Offer = require('../models/offer');
const Item = require('../models/item');
const User = require('../models/user');



exports.create = (req, res, next) => {
    //checks if user is logged in
    // if not redirects user to login
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to make offers');
        return res.redirect('/users/login');
    }
    
    //grabs the id of the item
    let musicId = req.params.id;

    //grabs the amount offer
    let amount = req.body.amount;
    

    //if id is invalid a 400 error is thrown
    if (!musicId.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    //searches for item based on music id 
    Item.findById(musicId)
        .then(item => {

            //if seller is trying to make offer on own item will throw a 401 error and not work
            if (item.seller.equals(req.session.user)) {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                throw err;
            }

            //this changest the highest offer and displays it on the page
            //based on the most recent price inserted
            //also increases total offers using $inc(increment)
            const updateMusic = Item.findByIdAndUpdate(musicId,{ $max: {highestOffer: amount}, $inc: {totalOffers: 1}});

            //fills in data for offer Schema 
            const offer = new Offer({
                amount: amount,
                userId: req.session.user,
                itemId: musicId
            });


            //saves offers in db
            const savedOffer = offer.save();

            return Promise.all([updateMusic, savedOffer]);

        })

        //redirects to the itmes page
        .then(() => res.redirect('/items/' + musicId))
        .catch(err=> next(err));
        
};

exports.getAllOffers = (req, res, next) => {

    if (!req.session.user) {
        req.flash('error', 'You must be logged in to make offers');
        return res.redirect('/users/login');
    }

    //grabs user
    let id = req.session.user;



    //grabs item id that is in the url
    let urlItemId = req.params.id;

    //looks through the offer db to check for offers that have urlItemId
    Offer.find({ itemId: urlItemId }).populate('itemId', 'userId')

    
    .then(offers => {

            
        if (offers) {

            //Grabs the user IDs from the offers
            const userIds = offers.map(offer => offer.userId);

            //finds users in the db based on the user IDs
            User.find({ _id: { $in: userIds } })
                .then(users => {
                    //renders offer page with the offers and the users 
                    res.render('./offer/offers', { offers, users });
                })
                .catch(err => next(err));
        } else {

            //if no offers are found throws a 404 error
            let err = new Error('Cannot find an item with id ' + urlItemId);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};


exports.acceptOffer = (req, res, next) => {

    
    // grabs the offer Id
    const offerId = req.params.offerId;

    //if user isn't logged in redirects them to login
    if (!req.session.user) {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');    
    } 


    //looks for offers in the db with id of offerId
    Offer.findById(offerId)
    .then(offer => {        

        // Update the offer item with offerId to 'accepted'
        return Offer.findByIdAndUpdate(offerId, { status: 'accepted' }, { new: true })

            .then(updatedOffer => {
        
                // Update all other offers on who doesn't share offerId for the same item to 'rejected' using $ne(not equal to)
                return Offer.updateMany({ itemId: updatedOffer.itemId, _id: { $ne: updatedOffer._id } }, { status: 'rejected' })
                    .then(() => {

                        // Sets active to false
                        return Item.findByIdAndUpdate(updatedOffer.itemId, { active: false });
                    });
            });
    })
    .then(() => {
        
        //and sends user back to profile page 
        res.redirect('/users/profile');
    })
    .catch(err => next(err));
};