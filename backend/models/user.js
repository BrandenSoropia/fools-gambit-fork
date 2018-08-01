const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new mongoose.Schema({ 
    username: {
        type: String,
        required: true, // Every instance of user must have this
        unique: true // There can never be 2 of the same values
    },
    password: String
});
userSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
