const express = require('express');
const app = express();
const autosize = require('autosize');
var methodOverride = require("method-override");
var flash     = require("connect-flash"); // 1
var session    = require("express-session");
// 첫날 만든 웹페이지들에 접근할 수 있게 만드는 부분
app.use(express.static('public/views'));
app.use(express.static('public/scripts'));
app.set('views', __dirname+'/public/views');
app.engine('html', require('ejs').renderFile);
var passport   = require("./config/passport")
// DB connection setting
const mongoose = require('mongoose');
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('DB connection success.');
})
mongoose.connect("mongodb://localhost/newbie_project", { useNewUrlParser: true })


// bodyParser: HTTP에서 필요한 데이터만 뽑기 쉽게 해주는 middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const voteSchema = require('./models/vote');
var util  = require("./util.js");
app.use(methodOverride("_method"));
app.use(flash()); // 2
app.use(session({secret:"MySecret", resave:true, saveUninitialized:true}));




// https://localhost:8000/vote/create로 날아오는 POST 요청을 처리하는 code
app.post('/vote/create/', (req, res) => {
    var d = new Date();
    console.log(d)
    const vote_elem = new voteSchema();
    console.log("/vote/create/")
    console.log(req.body);
    vote_elem.title = req.body.vote_input;
    vote_elem.content = req.body.vote_input2;
    vote_elem.date =d.getDate();
    vote_elem.month = d.getMonth();
    vote_elem.year = d.getFullYear();
    vote_elem.day = d.getDay();
    vote_elem.user = req.body.hidden;
    console.log("SHIT")
    vote_elem.save(err => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        console.log(vote_elem)
        console.log(`new vote added`);
        return res.redirect('/');
    })
})

app.get('/vote/retrieve', (req, res) => {
    console.log(req.currentUser)
    voteSchema.find({}, function(err, results){
        if (err) {
            console.log(err);
            res.status(500).end('DBError');
        }
        console.log('retrieve success');
        console.log(results);
        return res.json(results);
    })
})

app.post('/vote/update', (req, res)=>{
    console.log('/vote/update')
    console.log(req.body)
    var title = req.body.title;
    var content = req.body.content;
    voteSchema.findOneAndUpdate({ title }, { $set: { content: content }}, { new: true }, (err, results) => {
        console.log(results);
        if (err) return res.status(500).end('DBError');
        res.json(results);
    })
})

app.post('/vote/del', (req, res) => {
    var vote = req.body.content;
    console.log("what")
    console.log(req.body);
    console.log("what")
    voteSchema.deleteOne({ content: vote }, function(err, results){
        if (err) {
            console.log("delelte error")
        }
        console.log("delete success");
        return res.redirect('/');
    })
})

// https://localhost:8000 으로 접속하면 index.html 리턴해 줌







var User  = require("./models/User");
app.use(passport.initialize());
app.use(passport.session()); 
app.use(function(req,res,next){
 res.locals.isAuthenticated = req.isAuthenticated();
 res.locals.currentUser = req.user;
 next();
})

app.get("/users", function(req, res){
 User.find({})
 .sort({username:1})
 .exec(function(err, users){
  if(err) return res.json(err);
  res.redirect("/login")
 })
})


// New
app.get("/users/new", function(req, res){
 var user = req.flash("user")[0] || {};
 var errors = req.flash("errors")[0] || {};
 res.render("users/new.ejs", { user:user, errors:errors })
})

// create
app.post("/users", function(req, res){
 User.create(req.body, function(err, user){
  if(err){
   req.flash("user", req.body);
   req.flash("errors", parseError(err));
   return res.redirect("/users/new");
  }
  res.redirect("/users");
 });
});


// show
app.get("/users/:username", function(req, res){
 User.findOne({username:req.params.username}, function(err, user){
  if(err) return res.json(err);
  res.render("users/show.ejs", {user:user})
 })
})

// edit
app.get("/users/:username/edit", function(req, res){
 var user = req.flash("user")[0];
 var errors = req.flash("errors")[0] || {};
 if(!user){
  User.findOne({username:req.params.username}, function(err, user){
   if(err) return res.json(err);
   res.render("users/edit.ejs", { username:req.params.username, user:user, errors:errors })
  })
 } else {
  res.render("users/edit.ejs", { username:req.params.username, user:user, errors:errors })
 }
})

app.post("/login",
 function(req,res,next){
  var errors = {};
  var isValid = true;
  if(!req.body.username){
   isValid = false;
   errors.username = "Username is required!";
  }
  if(!req.body.password){
   isValid = false;
   errors.password = "Password is required!";
  }

  if(isValid){
   next();
  } else {
   req.flash("errors",errors);
   res.redirect("/login");
  }
 },
 passport.authenticate("local-login", {
  successRedirect : "/",
  failureRedirect : "/login"
 })
 );

app.get("/logout", function(req, res) {
 req.logout();
 res.redirect("/");
});

// Post Login // 3

// update // 2
app.put("/users/:username",function(req, res, next){
 User.findOne({username:req.params.username})
 .select({password:1})
 .exec(function(err, user){
  if(err) return res.json(err);

  // update user object ...

  // save updated user
  user.save(function(err, user){
   if(err){
    req.flash("user", req.body);
    req.flash("errors", parseError(err));
    return res.redirect("/users/"+req.params.username+"/edit");
   }
   res.redirect("/users/"+user.username);  });
 });
});





app.get("/login", function (req,res) {
 var username = req.flash("username")[0];
 var errors = req.flash("errors")[0] || {};
 res.render("login.ejs", {
  username:username,
  errors:errors
 })
})




function parseError(errors){
 var parsed = {};
 if(errors.name == 'ValidationError'){
  for(var name in errors.errors){
   var validationError = errors.errors[name];
   parsed[name] = { message:validationError.message };
  }
 } else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
  parsed.username = { message:"This username already exists!" };
 } else {
  parsed.unhandled = JSON.stringify(errors);
 }
 return parsed;
}








app.get('/', (req, res) => {
    res.render('home.ejs');
})
app.get('/list',(req,res) =>{
    res.render('list.html');
})

const server = app.listen(80, () => {
    console.log('server is running at port 80');
})