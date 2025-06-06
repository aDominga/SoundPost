const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//need a reference variable to the ITEMS collection in mongodb
//creating an item schema so that all items follow this model
const itemSchema = new Schema({
    title: { type: String, required: [true, 'title is required'] },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    condition: {
        type: String, required: [true, 'quality is required'],
        enum: ['New', 'Like New', 'Decent', 'Poor']
    },

    price: {
        type: Number, required: [true, 'price is required'],
        min: [.01, 'minimum price is $.01'],
        max: [80, 'maximum price is $80']
    },
    details: { type: String, required: [true, 'Artist of the piece must be listed'] },
    images: { type: String, required: [true, 'image is required'] },
    totalOffers: { type: Number, default: 0 },
    highestOffer: {type: Number, default: 0 },
    active: { type: Boolean, default: true }

});

//Collection name is Items in the database
module.exports = mongoose.model('Item', itemSchema);