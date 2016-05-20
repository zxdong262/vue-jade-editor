'use strict'

const koa = require('koa')
const Router = require('koa-router')
let route = new Router()
,Jade = require('koa-jade')
,oneYear = 1000 * 60 * 60 * 24 * 365
,serve = require('koa-static')
,path = require('path')

route.get('/', function* (next) {
	this.render('index')
})

module.exports = function() {

	var app = koa()

	app.use(serve( process.cwd() + '/bower_components', {
		maxAge: oneYear
	}))

	app.use(serve( process.cwd() + '/dist', {
		maxAge: oneYear
	}))

	//view engine
	var jade = new Jade({
		viewPath: __dirname + '/views'
		,debug: true
		,pretty: true
		,compileDebug: true
		,noCache: true
	})

	app.use(jade.middleware)

	app.use( route.routes() )
	app.use( route.allowedMethods() )

	return app
	//end
}