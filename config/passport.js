const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys')

// Load User model
const User = require('../models/User');

module.exports =
  function (passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        // Match user
        User.findOne({
          username: username
        }).then(user => {
          if (!user) {
            return done(null, false, { message: 'That username is not registered' });
          }

          // Match password
          console.log(user, user.password);
          bcrypt.compare(password, user.password, (err, isMatch) => {
            console.log(user, user["email"]);
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        });
      })
    );
    passport.use(
      new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/users/google/callback',
        proxy: true
      }, (accessToken, refreshToken, profile, done) => {
        //console.log(accessToken);
        //console.log(profile);
        //const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));
        const newUser = {
          googleID: profile.id,
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          image: profile.photos[0].value
        }

        //check for existing user
        User.findOne({ googleID: profile.id })
          .then(user => {
            if (user) {
              //return user
              done(null, user);
            }
            else {
              new User(newUser)
                .save()
                .then(user => done(null, user))
                .catch(err => { console.log(err) });
            }
          })
      })
    );

    passport.serializeUser(function (user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });
  }
