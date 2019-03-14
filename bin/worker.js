var mongoose = require('mongoose')

// mongoose.Promise = global.Promise

mongoose.connect(
	'mongodb://admin:Thuhuyen192@ds211096.mlab.com:11096/blog-express'
)

// mongoose.Promise = global.Promise
//
//
//

const Article = require('../models/article.js')

var { getScienceNews } = require('./../cronjob/cronjob.js')

getScienceNews()
