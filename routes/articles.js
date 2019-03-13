var express = require('express')
var router = express.Router()

var Article = require('../models/article.js')
var Category = require('../models/category.js')
var multer = require('multer')
var path = require('path')

const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function(req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
	},
})

const multerOptions = {
	// storage: multer.memoryStorage(),
	storage: storage,
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/')
		if (isPhoto) {
			next(null, true)
		} else {
			next({ message: "That filetype isn't allowed!" }, false)
		}
	},
}

const upload = multer(multerOptions).single('featuredimage')

/* GET home page. */
router.get('/', function(req, res, next) {
	Article.getArticles(function(err, articles) {
		if (err) {
			res.send(err)
		} else {
			res.render('articles', {
				title: 'All Articles',
				articles: articles,
			})
		}
	})
})

router.get('/show/:id', function(req, res, next) {
	Article.getArticleById([req.params.id], function(err, article) {
		if (err) {
			res.send(err)
		} else {
			res.render('article', {
				article: article,
			})
		}
	})
})

router.get('/category/:category_id', function(req, res, next) {
	Article.getArticles({ category: req.params.category_id }, function(
		err,
		articles
	) {
		if (err) {
			console.log(err)
			res.send(err)
		} else {
			Category.getCategoryById(req.params.category_id, function(
				err,
				category
			) {
				res.render('articles', {
					title: category.title,
					articles: articles,
				})
			})
		}
	})
})

router.post('/add', upload, function(req, res) {
	req.checkBody('title', 'Title is required').notEmpty()
	req.checkBody('author', 'Author field is required').notEmpty()
	req.checkBody('category', 'Category field is required').notEmpty()

	var errors = req.validationErrors()

	if (errors) {
		Category.getCategories(function(err, categories) {
			res.render('add_article', {
				errors: errors,
				title: 'Add Article',
				categories: categories,
			})
		})
	} else {
		console.log('req.body', req.body)
		console.log('req.file', req.file)
		var article = new Article()
		article.title = req.body.title
		article.summary = req.body.summary
		article.category = req.body.category
		article.body = req.body.body
		article.author = req.body.author
		article.featuredimage = req.file.filename

		Article.addArticle(article, function(err, article) {
			if (err) {
				res.send(err)
			} else {
				req.flash('success', 'Article Saved')
				res.redirect('/manage/articles')
			}
		})
	}
})

router.post('/edit/:id', function(req, res, next) {
	// Validation Rules
	req.checkBody('title', 'Title field is required').notEmpty()
	req.checkBody('author', 'Author field is required').notEmpty()
	req.checkBody('category', 'Category field is required').notEmpty()
	// Check Errors
	var errors = req.validationErrors()

	if (errors) {
		res.render('edit_article', {
			errors: errors,
			title: req.body.title,
			summary: req.body.summary,
			body: req.body.body,
			author: req.body.author,
			category: req.body.category,
		})
	} else {
		var article = new Article()
		var query = { _id: [req.params.id] }
		var update = {
			title: req.body.title,
			summary: req.body.summary,
			category: req.body.category,
			author: req.body.author,
		}

		Article.updateArticle(query, update, {}, function(err, article) {
			if (err) {
				res.send('Error: ' + err)
			} else {
				req.flash('success', 'Article Updated')
				res.location('/manage/articles')
				res.redirect('/manage/articles')
			}
		})
	}
})

router.delete('/delete/:id', function(req, res) {
	var query = { _id: [req.params.id] }
	Article.remove(query, function(err) {
		if (err) {
			res.send('Error: ' + err)
		} else {
			res.status(204).send()
		}
	})
})

router.post('/comments/add/:id', function(req, res, next) {
	// Validation Rules
	req.checkBody('comment_subject', 'Subject field is required').notEmpty()
	req.checkBody('comment_author', 'Author field is required').notEmpty()
	req.checkBody('comment_body', 'Body field is required').notEmpty()
	// Check Errors
	var errors = req.validationErrors()

	if (errors) {
		Article.getArticleById([req.params.id], function(err, article) {
			if (err) {
				console.log(err)
				res.send(err)
			} else {
				res.render('article', {
					errors: errors,
					article: article,
					comment_subject: req.body.comment_subject,
					comment_author: req.body.comment_author,
					comment_body: req.body.comment_body,
					comment_email: req.body.comment_email,
				})
			}
		})
	} else {
		var article = new Article()
		var query = { _id: [req.params.id] }

		var comment = {
			comment_subject: req.body.comment_subject,
			comment_author: req.body.comment_author,
			comment_body: req.body.comment_body,
			comment_email: req.body.comment_email,
		}

		Article.addComment(query, comment, function(err, article) {
			if (err) {
				res.send('Error: ' + err)
			} else {
				Article.getArticleById([req.params.id], function(err, article) {
					if (err) {
						console.log(err)
						res.send(err)
					} else {
						res.render('article', {
							article: article,
							successMsg: 'Comment Added',
						})
					}
				})
			}
		})
	}
})

module.exports = router
