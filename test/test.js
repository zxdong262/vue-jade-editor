
describe('vue-jade-editor', function () {

	var scope, sandboxEl
	var vmm

	beforeEach(function () {
		sandboxEl = $('<div>').attr('id', 'sandbox').appendTo($('body'))
	})

	afterEach(function() {
		vmm.$destroy()
		$('#sandbox').remove( )
	})

	var elem = '<div id="test"><jadeeditor v-bind:content.sync="content", v-bind:lang="lang", v-bind:maxlength="maxlength"><jadeeditor></div>'
	
	function prepare(data) {
		var element = $(elem).appendTo(sandboxEl)
		var defs = {
			el: '#test'
			,data: {
				maxlength: 1000
				,lang: 'jade'
				,content: ''
			}
		}
		if(data) $.extend(defs.data, data)

		vmm = new Vue(defs)
		return vmm
	}

	// Tests

	describe('basic', function () {

		it('init', function(done) {
			var vmm = prepare()
			Vue.nextTick(function() {
				var pts = $('#test').find('.jade-editor')
				expect(pts.length).to.equal(1)
				done()
			})
		})

	})

	describe('options', function () {

		it('init content="init content"', function(done) {
			var vmm = prepare({
				content: 'init content'
			})
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('init content')
				done()
			})
		})

		it('init lang="css"', function(done) {
			var vmm = prepare({
				lang: 'css'
			})
			Vue.nextTick(function() {
				var pts = $('#test').find('pre')
				//console.log(pts)
				expect(pts.prop('lang')).to.equal('css')
				done()
			})
		})

	})


	describe('insert html event', function () {

		it('init content="init content"', function(done) {
			var vmm = prepare({
				content: 'init content'
			})

			vmm.$broadcast('je-insert-content', 'custom')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('custominit content')
				done()
			})
		})

	})

	//end
})
