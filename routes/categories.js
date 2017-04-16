/**
 * Created by Sinner on 14-Apr-17.
 */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');



router.get('/show/:category', function (req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({category: req.params.category},{}, function (err, posts) {
		res.render('index',{
			"title":req.params.category,
			"posts" : posts
		});
	});
});

/* home page blog Post. */
router.get('/add', function(req, res, next) {
	res.render('addCategory',{
		"title":"Add Category"
	});
});

router.post('/add', function(req, res, next) {
	
	var title       = req.body.title;
	
	//form Validations
	req.checkBody('title','Title field is required').notEmpty();
	
	var errors = req.validationErrors();
	
	if(errors){
		res.render('addCategory',{
			"errors": errors,
			"title" : title
		});
	}else{
		var categories = db.get('categories');
		
		// add it to db
		categories.insert({
			"title":title
		}, function (err, post) {
			if(err){
				res.send('There was an issue submitting the category');
			}else{
				req.flash('success', "Category Submitted");
				res.location('/');
				res.redirect('/');
			}
		});
	}
	
});

module.exports = router;
