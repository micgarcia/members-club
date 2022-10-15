require('dotenv').config();
var express = require('express');
var router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, check, validationResult } = require('express-validator');
const Users = require('../models/users.js');
const Messages = require('../models/messages.js');
const { DateTime } = require("luxon");


/* GET home page. */
router.get('/', function(req, res, next) {
  Messages.find({})
    .populate('sender')
    .exec(function (err, messages) {
      if (err) {
        return next(err)
      }
      res.render('index', {
        title: 'Members Only',
        user: req.user,
        messages: messages
      });
    })
});

// GET sign up form
router.get('/sign-up', function(req, res, next) {
  res.render("sign-up")
});

// POST sign up form
router.post('/sign-up',
  body("first_name", "First Name must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  body("last_name", "Last Name must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  check('confirmPassword', 'Password should be the same')
    .trim()
    .isLength({min:4, max:16})
    .custom((confirmPassword, {req}) => confirmPassword === req.body.password),


  (req, res, next) => {
    let tempUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("sign-up", {
        user: tempUser,
        errors: errors.array()
      });
      return;
    }
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const user = new Users({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.email,
        password: hashedPassword,
        member_status: 'normal'
      }).save(err => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      })
    })
  }
)

// GET log-in form
router.post("/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

// GET secret password join page/form
router.get("/join", (req, res) => {
  res.render('join', {
    user: req.user
  })
})

// POST join form
router.post('/join',
  body("secret", "Secret must not be empty")
    .trim()
    .isLength({min:1})
    .escape(),
  check('secret', 'Entered Code does not match Secret Code')
    .trim()
    .custom((value) => value === process.env.CODE),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("join", {
        user: req.user,
        errors: errors.array()
      });
      return;
    }

    const user = new Users({
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      username: req.user.username,
      password: req.user.password,
      member_status: 'vip',
      _id: req.user.id
    })

    Users.findByIdAndUpdate(req.user.id, user, {}, (err, theuser) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    })
  }
);

// GET log out
router.get('/log-out', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// GET send message
router.get('/send', (req, res, next) => {
  res.render('send', {
    user: req.user
  })
})

// POST send message
router.post('/send',
  body("message", "Message must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('send', {
        user: req.user,
        errors: errors.array()
      })
    }
    const message = new Messages({
      title: req.body.title,
      text: req.body.message,
      timestamp: DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
      sender: req.user
    }).save((err) => {
      if (err) {
        return next(err)
      }
      res.redirect('/');
    })
  }
)

module.exports = router;
