
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

	var elem = '<div id="test"><jadeeditor v-bind:content.sync="content", v-bind:rows="rows"><jadeeditor></div>'
	
	function prepare(data) {
		var element = $(elem).appendTo(sandboxEl)
		var defs = {
			el: '#test'
			,data: {
				content: ''
				,rows: 2
			}
		}
		if(data) $.extend(defs.data, data)
		Vue.use(jadeEditor)
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

		it('init content="init content"', function(done) {
			var vmm = prepare({
				rows: 5
			})
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.height() > 80).to.equal(true)
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
