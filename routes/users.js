var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret : process.env.JWT_SECRET,
  userProperty : 'payload'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json('respond with a resource');
});

//TODO only using for testing till a real route uses auth
router.get('/tempAuthorized', auth, function(req, res, next) {
  res.json('only visible logged in');
});

module.exports = router;
