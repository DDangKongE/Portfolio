const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); 

// schema
var skillSchema = mongoose.Schema({
    num:{type:Number, default:0},
    type:{type:String, required:[true,'type is required!']},
    skillname:{type:String, required:[true,'skillname is required!']},
    img:{type:String, required:[true,'img is required!']},
    createAt:{type:Date, default:Date.now}
});

skillSchema.plugin(AutoIncrement, {inc_field: 'num'});

var Skills = mongoose.model('skill', skillSchema);

module.exports = Skills;