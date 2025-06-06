const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

//creates schema for user 
const userSchema = new Schema({
    firstName: { type: String, required: [true, 'first name is required'] },
    lastName: { type: String, required: [true, 'last name is required'] },
    email: { type: String, required: [true, 'email is required'], unique: true },
    password: { type: String, required: [true, 'password is required'] }
});

//replace plain text password with hashed password before saving the document in the database 
//pre middleware
userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')) {
        return next();
    } else {
        bcrypt.hash(user.password, 12)
            .then(hash => {
                user.password = hash;
                next();
            })
            .catch(err => next(err));
    }
});

//this compares passwords
userSchema.methods.comparePassword = function (loginPassword) {
    return bcrypt.compare(loginPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);