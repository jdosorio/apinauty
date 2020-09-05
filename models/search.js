var mongoose=require('mongoose');
const confiq=require('../config/config').get(process.env.NODE_ENV);
const salt=10;

const searchSchema=mongoose.Schema({
    city:{
        type: String,
        required: false,
        maxlength: 100
    },
    latitude:{
        type: String,
        required: false,
        maxlength: 100
    },
    longitude:{
        type: String,
        required: false,        
    },
    user:{
        type:String,
        required: false
    },
    error:{
        type:String,
        required: false
    }   
});

searchSchema.methods.getAll=function(token,cb){
    var search=this;

    search.find();
    
}

module.exports=mongoose.model('Search',searchSchema);