var express = require('express');
var router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, check, validationResult } = require('express-validator');
const Users = require('../models/users.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sign-up', function(req, res, next) {
  res.render("sign-up")
});

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

module.exports = router;
