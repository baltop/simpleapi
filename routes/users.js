var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



router.get('/my', function(req, res, next) {
  res.render('users', { 
      title: 'Users'
  });
});



module.exports = router;
