var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var path = require('path')
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() +  path.extname(file.originalname));
	}
});
var upload = multer({ storage: storage });
//var upload = multer({ dest: './uploads' });


router.get('/show/:id', function (req, res, next) {
	var posts = db.get('posts');
	
	posts.findById(req.params.id, function (err, post) {
		res.render('show', {
			"post" : post
		});
	});
})

/* home page blog Post. */
router.get('/add', function(req, res, next) {
	var categoryList = db.get('categories');
	categoryList.find({},{}, function (err, categoryList) {
		/*console.log("Categories"+categories);
		categories.forEach(function(category){
			console.log(category.title);
		});*/
		res.render('addPost',{
			"title": "Add Post",
			"catList" : categoryList
		});
	});
	
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
	// get form values
	var title       = req.body.title;
	var category    = req.body.category;
	var body        = req.body.body;
	var author      = req.body.author;
	var date        = new Date();
	
	
	//Check for image field
	if(req.file){
		console.log('Uploading file...');
		var mainImageOrginalName = req.file.originalname;
		var mainImageName = req.file.filename;
		var mainImageMime = req.file.mimetype;
		var mainImagePath = req.file.path;
		var mainImageSize = req.file.size;
	}
	else{
		console.log('mainImageFile not found....');
		var mainImageName = 'noimage.png';
	}
	
	//form Validations
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body','Body field is required').notEmpty();
	
	var errors = req.validationErrors();
	if(errors){
		res.render('addPost',{
			"errors": errors,
			"title" : title,
			"body" : body
		});
	}else{
		var posts = db.get('posts');
		
		// add it to db
		posts.insert({
			"title":title,
			"body":body,
			"category": category,
			"date":date,
			"author":author,
			"mainimage":mainImageName
		}, function (err, post) {
			if(err){
				res.send('There was an issue submitting the post');
			}else{
				req.flash('success', "Post Submitted");
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

router.post('/addcomment', function(req, res, next) {
	// get form values
	var name       = req.body.name;
	var email    = req.body.email;
	var body        = req.body.body;
	var postid      = req.body.postid;
	var commentdate        = new Date();
	
	
	//form Validations
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email is not formatted correctly').isEmail();
	req.checkBody('body','Body field is required').notEmpty();
	
	var errors = req.validationErrors();
	
	if(errors){
		var posts = db.get('posts');
		posts.findById(postid, function(err, post){
			res.render('show',{
				"errors": errors,
				"post" : post
			});
		});
	}else{
		var comment = {"name":name, "email":email, "body":body, "commentsdate" :commentdate};
		
		var posts = db.get('posts');
		
		// add it to db
		posts.update({
				"_id" : postid
			},
			{
				$push : {
					"comments" : comment
				}
			},
			function (err, doc) {
				if(err){
					throw err;
				}else{
					req.flash('success', 'Comment Added');
					res.location('/posts/show/'+postid);
					res.redirect('/posts/show/'+postid);
				}
			}
		);
	}
});

module.exports = router;
	
