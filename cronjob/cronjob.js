var CronJob = require('cron').CronJob
var Crawler = require('crawler')
var Article = require('./../models/article.js')
const download = require('image-downloader')

async function downloadIMG(option) {
	option.dest = './public/uploads/'
	try {
		const { filename, image } = await download.image(option)
		let str2 = filename.replace('public/uploads/', '')
		let str3 = str2.replace('public\\uploads\\', '')
		return str3
	} catch (e) {
		console.error(e)
	}
}

var cronjob = () => {
	return new CronJob(
		'0 */2 * * *',
		// '* * * * * *',
		//'*/2 * * * * *',
		//'* * * * *',
		async function() {
			console.log('run cronjob')

			//getScienceNews()
		},
		null,
		true,
		'America/Los_Angeles'
	)
}

function getScienceNews() {
	console.log('getScienceNews')
	let rootUrl = 'https://www.the-scientist.com'
	var c = new Crawler({
		maxConnections: 10,
		// This will be called for each crawled page
		callback: function(error, res, done) {
			if (error) {
				console.log(error)
			} else {
				var $ = res.$
				// $ is Cheerio by default
				//a lean implementation of core jQuery designed specifically for the server

				const ob = $('.ArticleSummary header > a')

				for (let i = 0; i < ob.length; i++) {
					console.log(ob[i].attribs.href)
					let detailUrl = rootUrl + ob[i].attribs.href
					fetchNews(detailUrl)
				}
				console.log('fetch complete')
			}

			done()
		},
	})

	c.queue(rootUrl)
}

async function fetchNews(url) {
	var c = new Crawler({
		maxConnections: 10,
		// This will be called for each crawled page
		callback: async function(error, res, done) {
			if (error) {
				console.log(error)
			} else {
				var $ = res.$
				// $ is Cheerio by default
				//a lean implementation of core jQuery designed specifically for the server

				let title = $('main header > h1').text()

				let x = await Article.find({})
				let y = x.map(article => article.title)
				let z = y.includes(title)
				if (z) return
				let summary = $('article header > h2').text()
				let body = $('#ArticleBody').html()
				let img = $('picture > source')[3].attribs.srcset

				let imgName = await downloadIMG({ url: img })

				// save image to database
				var article = new Article()
				article.title = title
				article.body = body
				article.summary = summary
				article.featuredimage = imgName
				Article.addArticle(article, function(err, article) {
					if (err) {
						console.log('err', err)
					} else {
						console.log('article', article)
					}
				})
			}
			done()
		},
	})

	c.queue(url)
}

module.exports = { cronjob, getScienceNews, fetchNews }
