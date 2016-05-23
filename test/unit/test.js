
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

	var elem = '<div id="test"><jadeeditor v-bind:content.sync="content", v-bind:rows="rows", :id="jid"><jadeeditor></div>'
	
	function prepare(data) {
		var element = $(elem).appendTo(sandboxEl)
		var defs = {
			el: '#test'
			,data: {
				content: ''
				,rows: 2
				,jid: 'xx'
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

		it('rows = 5', function(done) {
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

		it('change component defination', function(done) {
			jadeEditor.default.events['je-paired-tagx'] = function(tag, id) {

					if(id !== this.id) return

					this.insertParedTag(tag + 'x', this.updateSyntax)

			}
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			vmm.$broadcast('je-paired-tagx', 'i', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('<ix></ix>init content')
				done()
			})
		})

	})


	describe('events', function () {


		it('insert html ok', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})

			vmm.$broadcast('je-insert-content', 'custom', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('custominit content')
				done()
			})
		})

		it('tab', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			var dom = $('#test').find('textarea')[0]
			dom.selectionStart = 0
			dom.selectionEnd = 0
			vmm.$broadcast('je-tab', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('    init content')
				done()
			})
		})

		it('i', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			vmm.$broadcast('je-paired-tag', 'i', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('<i></i>init content')
				done()
			})
		})

		it('b', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			vmm.$broadcast('je-paired-tag', 'b', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('<b></b>init content')
				done()
			})
		})

		it('pared content: {}', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			vmm.$broadcast('je-paired-content', '{', '}', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('{}init content')
				done()
			})
		})


		it('pared content with selection: {}', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			var dom = $('#test').find('textarea')[0]
			dom.selectionStart = 0
			dom.selectionEnd = 1
			vmm.$broadcast('je-paired-content', '{', '}', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('{i}nit content')
				done()
			})
		})

		it('untab', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})
			var dom = $('#test').find('textarea')[0]
			dom.selectionStart = 0
			dom.selectionEnd = 0
			vmm.$broadcast('je-insert-content', '        ', 'cc')
			vmm.$broadcast('je-untab', 'cc')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('    init content')
				done()
			})
		})

		it('insert html not ok with false id', function(done) {
			var vmm = prepare({
				content: 'init content'
				,jid: 'cc'
			})

			vmm.$broadcast('je-insert-content', 'custom', 'ccx')
			Vue.nextTick(function() {
				var pts = $('#test').find('textarea')
				//console.log(pts)
				expect(pts.val()).to.equal('init content')
				done()
			})
		})

	})

	//end
})
