const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ArticleSchema = new Schema({
	title: {
		type: String,
	},
	summary: {
		type: String,
	},
	category: {
		type: String,
	},
	body: {
		type: String,
	},
	featuredimage: {
		type: String,
	},
	author: {
		type: String,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	comments: [
		{
			comment_subject: {
				type: String,
			},
			comment_body: {
				type: String,
			},
			comment_author: {
				type: String,
			},
			comment_email: {
				type: String,
			},
			comment_date: {
				type: String,
			},
		},
	],
})

const Article = mongoose.model('Article', ArticleSchema)

module.exports = Article
/////////////

// Get Articles
module.exports.getArticles = function(query, callback, limit) {
	Article.find(query, callback)
		.limit(limit)
		.sort({ created_at: -1 })
}

// Add Article
module.exports.addArticle = function(article, callback) {
	Article.create(article, callback)
}

// Get Single Article
module.exports.getArticleById = function(id, callback) {
	Article.findById(id, callback)
}

// Update Article
module.exports.updateArticle = function(query, update, options, callback) {
	Article.findOneAndUpdate(query, update, options, callback)
}

// Add Comment
module.exports.addComment = function(query, comment, callback) {
	Article.update(
		query,
		{
			$push: {
				comments: comment,
			},
		},
		callback
	)
}
