var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


/* home page blog Post. */
router.get('/', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
  
  posts.find({},{sort :{date : -1}},function(err, posts){
	  res.render('index', {
  		'posts':posts
	  })
  });
	
});

module.exports = router;
