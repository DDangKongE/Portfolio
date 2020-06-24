const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); 

// schema
var userSchema = mongoose.Schema({
    username:{type:String, required:[true,'username is required!']},
    password:{type:String, required:[true,'password is required!']},
});

userSchema.method.comparePassword = function(inputPassword, cb){
    if(inputPassword === this.password){
        cb(null, true);
    } else {
        cb('error');
    }
};

var Users = mongoose.model('users', userSchema, 'users');

module.exports = Users;