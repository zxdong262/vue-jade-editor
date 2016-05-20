'use strict'

let config = require('../config')
,port = config.port
,host = 'http://127.0.0.1:' + port
,pack = require('../../../package.json')

//disable
exports['@disabled'] = 0

exports[pack.name + '@' + pack.version] = function(browser) {

	var $ = browser
	var ta = '#app textarea'

	browser
		.url(host)
		.waitForElementVisible(ta, 5000)
		.click(ta)
		.keys($.Keys.ENTER)
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'init content\n    ')
		})
		.clearValue(ta)
		.setValue(ta, 'ul\nli dd')
		.click(ta)
		.keys([$.Keys.CONTROL, 'b'])
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'ul\n    li dd<b></b>')
			this.keys([$.Keys.CONTROL])
		})
		
		.keys([$.Keys.CONTROL, 'i'])
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'ul\n    li dd<b><i></i></b>')
			this.keys([$.Keys.CONTROL])
		})
		.keys([$.Keys.SHIFT, '['])
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'ul\n    li dd<b><i>{}</i></b>')
			this.keys([$.Keys.SHIFT])
		})
		.keys([$.Keys.CONTROL, '['])
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'ul\nli dd<b><i>{}</i></b>')
			this.keys([$.Keys.CONTROL])
		})
		.keys(['['])
		.getValue(ta, function(result) {
			this.assert.equal(result.value, 'ul\n[]li dd<b><i>{}</i></b>')
		})
		.end()

}
