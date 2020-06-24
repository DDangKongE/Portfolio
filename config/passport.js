const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/users.js');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
      }, function (req, username, password, done) {
        console.log(username);
        console.log(password);
        if(username === process.env.MANAGER_ID && password === process.env.MANAGER_PW){
          return done(null, {
            'user_id': username,
          });
        }else{
          return done(false, null)
        }
      }));
};