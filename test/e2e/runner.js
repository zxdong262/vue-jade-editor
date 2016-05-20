'use strict'

process.env.NODE_ENV = 'production'

let port = require('./config').port

,co = require('co')

let app = require('./server')()
app.listen(port, function() {
	console.log('' + new Date(), 'server', 'runs on port', port)
	var spawn = require('cross-spawn')
	var runner = spawn(
		'./node_modules/.bin/nightwatch',
		[
			'--config', 'test/e2e/nightwatch.conf.js',
			'--env', 'chrome'
		],
		{
			stdio: 'inherit'
		}
	)

	runner.on('exit', function (code) {
		process.exit(code)
	})

	runner.on('error', function (err) {
		throw err
	})
})
