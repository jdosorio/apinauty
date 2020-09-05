const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const Search=require('./models/search');
const {auth} =require('./middlewares/auth');
const db=require('./config/config').get(process.env.NODE_ENV);
const {Client} = require("@googlemaps/google-maps-services-js");


const app=express();

app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log(db.DATABASE)
    console.log("database is connected");
});



app.post('/api/register',function(req,res){
   const newuser=new User(req.body);
   console.log(newuser);   
   
   User.findOne({email:newuser.email},function(err,user){
       if(user) return res.status(400).json({ auth : false, message :"email exits"});

       newuser.save((err,doc)=>{
           if(err) {console.log(err);
               return res.status(400).json({ success : false});}
           res.status(200).json({
               succes:true,
               user : doc
           });
       });
   });
});

app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are login!!"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password does not match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id,
                        email : user.email
                    });
                });    
            });
          });
        }
    });
});

app.get('/api/places', auth, function(req,res) {
    console.log(req.body.latitud)
    var key = "AIzaSyB2tZ5Hocm7aJVsVu9AwZC8dwiNe36moSw";
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var city = req.query.city;
    var radius = 10000;
    var sensor = false;
    var types = "restaurant";
    var https = require('https');  
    var error = false;  
    var url;

    if(latitude && longitude){
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + latitude + ',' + longitude + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types;    
    }

    if(city){
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + "key=" + key + "&query=" + city + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types;    
    }

    if(!latitude && !longitude && !city){
        error = true;
        return res.json({"message": "Needed Parameters"})
    }
    
    
    https.get(url, function(response) {
        var body ='';
    
        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var places = JSON.parse(body);
            var locations = places.results;   
            const newSearch = new Search({
                city:city,
                latitude: latitude,
                longitude: longitude,
                user: req.user.firstname + req.user.lastname,
                error: error
            });
            
            newSearch.save((err,doc)=>{
                if(err) {console.log(err);
                    return res.status(400).json({ success : false});}
                console.log("insert")
            });

            res.json(locations);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

app.get('/api/searchs', auth, function(req,res) {
    Search.find({},function(err,search){
        if(err) throw err;
        res.json(search)
    });
});

 app.get('/api/logout',auth,function(req,res){
        req.user.deleteToken(req.token,(err,user)=>{
            if(err) return res.status(400).send(err);
            res.sendStatus(200);
        });

    }); 

app.get('/',function(req,res){
    res.status(200).send(`Welcome to places api `);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app run at ${PORT}`);
});