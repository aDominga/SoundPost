const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    amount: {type: Number, required: [true, 'A value is necesary to make an offer']},
    status: { type: String, enum: ['pending', 'rejected', 'accepted'], default: 'pending'  }, 
    userId: {type: Schema.Types.ObjectId, ref:'User'},
    itemId: {type: Schema.Types.ObjectId, ref:'Item'}
});

module.exports = mongoose.model('Offer', offerSchema);