var Article = require('./../models/article.js')

function getArticles() {
	console.log('ggggggggggggg')
	console.log('Article', Article)
	Article.getArticles({}, function(err, articles) {
		if (err) {
			console.log(err)
		} else {
			console.log(1)
		}
	})
	console.log('hhhhhhhhhhhhh')
}
getArticles()

// var articles
// ;(async function() {
// 	articles = await getArticles()
// })()

// setTimeout(() => {
// 	console.log('articles', articles)
// }, 3000)
