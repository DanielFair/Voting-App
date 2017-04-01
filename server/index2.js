const express = require('express');
const path = require('path');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Poll = require('./pollschema.js');
const bodyParser = require('body-parser');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000;
const URL = 'mongodb://localhost:27017/votingapp';

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

//Configure middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require('cookie-parser'));
app.use(require('morgan')('combined'));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//Setup twitter passport strategy
passport.use(new Strategy({
    consumerKey: 'OuVxsRZMs7htXBuPXK6iNXzRr',
    consumerSecret: 'ilYiFMmx3yBJ0BtQ5ijzBsckc4kZvEwLIBk28FiUPmhhce5FfV',
    callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
app.use(session({
  secret: 'passport hidden',
  resave: true,
  saveUninitialized: true
}));

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Connect to database then start the server
mongoose.connect(URL, (err, database) => {
  if(err) throw err;
  db = database;
  console.log('Mongoose connected to DB!');
  app.listen(PORT, () => {
    console.log('Listening on port ',PORT);
  });
});

// Answer API requests and handle routing
app.get('/api', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

app.get('/api/displayPolls', (req, res) => {
  Poll.find({}, (err, polls) => {
    if(err) throw err;

    res.send(polls);
  });
});

app.get('/api/displaypoll/:title', (req, res) => {
  Poll.findOne({title: req.params.title}, (err, result) => {
    if(err) throw err;
    // console.log(result);
    res.send(result);
  });
});

//Handle submitting a new poll
app.post('/addnew', (req, res) => {
  console.log(req.body.pollOptions);
  let optionsArr = req.body.pollOptions.split('\n').join('').split('\r');

  let voteCounts = {};
  optionsArr.forEach((option) => {
    console.log(option);
    voteCounts[option] = 0;
  });
  let newPoll = new Poll({
    title: req.body.pollTitle,
    options: optionsArr,
    votecounts: voteCounts
  });
  newPoll.save((err) => {
    if(err) throw err;
    console.log('New Poll saved successfully!');
    res.redirect('/');
  })
});

//Handle voting
app.post('/submitvote/:title', (req, res) => {
  let targetOption = req.body.voteselection;
  let key = 'votecounts.'+targetOption;
  let obj = {};
  obj[key] = 1;
  Poll.findOneAndUpdate(
    {'title': req.params.title},
    {$inc: obj},
    (err, poll) => {
      if(err) throw err;
      console.log('Updated votecount!');
      let redirectUrl = '/polls/'+req.params.title;
      res.redirect(redirectUrl);
    });
});

//Passport authentication for login
app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/login/twitter/return',
  passport.authenticate('twitter', {failureRedirect: '/login'}),
  (req, res) => {
    //If login successful redirect home
    res.redirect('/');
  });

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

