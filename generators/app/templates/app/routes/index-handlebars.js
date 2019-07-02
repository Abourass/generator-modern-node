'use strict';

const express = require('express');
const csrf = require('csurf');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const csrfProtection = csrf({cookie: true});
const parseForm = bodyParser.urlencoded({extended: false});
const {ensureAuthenticated} = require('../helpers/auth');
// ======================================================================| Load Schema Below
const User = mongoose.model('users');


router.get('/', csrfProtection, (req, res) => {
  try {
    res.render('index/dashboard', {
      csrfToken: req.csrfToken(), // ============================| This create the unique csrfToken that we add to a hidden input to prevent Cross-Site Request Forgery
      title: '<%= appName %>', // =========================| title is a string that sets the page title
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
