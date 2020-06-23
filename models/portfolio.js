const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); 

// schema
var portfolioSchema = mongoose.Schema({
    index:{type:Number, default:0},
    projectname:{type:String, require:[true,'projectname is required!']},
    projectstart:{type:String, default:'0000.00', require:[true,'projectstart is required!']},
    projectend:{type:String, default:'현재 진행중', require:[true,'projectend is required!']},
    subject:{type:String, required:[true,'subject is required!']},
    uselibrary:{type:String, required:[true,'library is required!']},
    projectdetail:{type:String, required:[true,'projectdetail is required!']},
    img:{type:String, required:[true,'img is required!']},
    createAt:{type:Date, default:Date.now}
});

portfolioSchema.plugin(AutoIncrement, {inc_field: 'index'});

var Portfolio = mongoose.model('portfolio', portfolioSchema);

module.exports = Portfolio;