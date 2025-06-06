const express = require('express');
const controller = require('../controllers/offerController');
const { isUnAuth, isSeller} = require('../middlewares/auth');
const router = express.Router({mergeParams: true});



router.post('/', controller.create);

router.get('/', controller.getAllOffers);

router.post('/:offerId/accept', controller.acceptOffer); 


module.exports = router;



