const express = require('express');
const path = require('path');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Poll = require('./pollschema.js');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;
// const URL = 'mongodb://localhost:27017/votingapp';
const URL = 'mongodb://admin:publicuser@ds147920.mlab.com:47920/votingapp';
const passport = require('passport');
const session = require('express-session');
var userObj;

//Configure Passport strategy
const GithubStrategy = require('passport-github').Strategy;

passport.use(new GithubStrategy({
    clientID: '1312e73bd47dae9f657b',
    clientSecret: '6df54171d5675e9b6178699c574f4bbb0f693faf',
    callbackURL: 'http://127.0.0.1:5000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
//Passport session setup
app.use(session({
  secret: 'session secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

//Configure middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//Connect to database then start the server
mongoose.connect(URL, (err, database) => {
  if(err) throw err;
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
  // console.log(req.params);
  console.log(req.params.title);
  Poll.findOne({_id: req.params.title}, (err, result) => {
    if(err) throw err;
    // console.log(result);
    res.send(result);
  });
});

//Retrieve an array of the user's polls
app.post('/api/displaymypolls', (req, res) => {
  // console.log('req.body: ',req.body);
  // console.log('req.body.username: ', req.body.username);
  Poll.find({author: req.body.username}, (err, polls) => {
    if(err) throw err;
    res.send(polls);
  });  
});

//Handle adding a custom voting option to a poll
app.post('/api/addcustom', (req, res) => {
  Poll.findOneAndUpdate(
        {'title': req.body.title},
        {$push: {'options': req.body.option}},
        (err, poll) => {
          if(err) throw err;
          console.log('Updated poll with new option!');
          res.send();
      });
})
//Handle submitting a new poll
app.post('/api/addnew', (req, res) => {
  // console.log(req.body.pollOptions);
  let optionsArr = req.body.pollOptions.split('\n');
  let voteCounts = {};
  optionsArr.forEach((option) => {
    console.log(option);
    voteCounts[option] = 0;
  });
  // console.log('da: '+req.body.pollAuthor);
  let newPoll = new Poll({
    title: req.body.pollTitle,
    options: optionsArr,
    votecounts: voteCounts,
    author: req.body.pollAuthor
  });
  newPoll.save((err) => {
    if(err) throw err;
    console.log('New Poll saved successfully!');
    res.send();
    // res.redirect('/');
  })
});

//Handle deleting a poll
app.delete('/api/delete/:title', (req, res) => {
  console.log('deleting '+req.params.title);
  Poll.findOneAndRemove(
    {title: req.params.title}, (err, result) =>{
      if(err) console.log(err);
      console.log('deleted successfully');
      console.log('result: ', result);
      res.send();
  });
});

//Handle voting
app.post('/api/submitvote', (req, res) => {
  let IP = req.connection.remoteAddress.split(':').pop();
  let targetOption = req.body.selectedOption;
  let key = 'votecounts.'+targetOption;
  let obj = {};
  obj[key] = 1;
  Poll.findOne({'title': req.body.title}, (err, poll) => {
    if(err) throw err;
    console.log('poll.voted: ',poll.voted);
    // Check if this IP has voted already
    let alreadyVoted = false;
    poll.voted.forEach((voteIP) => {
      if(voteIP == IP){
        alreadyVoted = true;
        // res.send('Already voted');
      }
    })
    if(!alreadyVoted){
      Poll.findOneAndUpdate(

        {'title': req.body.title},
        {$inc: obj,
        $push: {'voted': IP}},
        (err, poll) => {
          if(err) throw err;
          console.log('Updated votecount!');
          res.send();
          // let redirectUrl = '/polls/'+req.params.title;
          // res.redirect(redirectUrl);
      });
    }
    else{
      res.send("Already voted");
    }
  });
});
//Passport login route
app.get('/auth/github', passport.authenticate('github'));

//Retrieve user obj
app.get('/getuser', (req, res) => {
  if(userObj){
    res.send(userObj);
  }
  else{
    res.send('No user!');
  }
});
//Github callback route
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: 'https://blooming-waters-58260.herokuapp.com' }),
  (req, res) => {
    console.log('hit callback route for auth');
    // console.log(req.user);
    userObj = req.user;
    // res.redirect(req.session.backURL || '/')
    res.redirect('https://blooming-waters-58260.herokuapp.com');
  }
);
//Handle passport logout route
app.get('/logout', (req, res) => {
  console.log('logging out!');
  req.logout();
  userObj = req.user;
  res.redirect('https://blooming-waters-58260.herokuapp.com');
});
// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

//Passport authentication for login
