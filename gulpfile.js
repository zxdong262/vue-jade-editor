
var gulp = require('gulp')
var path = require('path')
var util = require('util')
var gutil = require('gulp-util')
var runSequence = require('run-sequence')
var fs = require('fs')
var watch = require('gulp-watch')
var rename = require('gulp-rename')
var plumber = require('gulp-plumber')
,newer = require('gulp-newer')
// CONFIG
//

var src = {
	cwd: __dirname + '/src'
	,dist: __dirname + '/dist'
}

// SCRIPTS
//
var uglify = require('gulp-uglify')
var concat = require('gulp-concat-util')

gulp.task('ugly', function() {

	var pkg = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString())

	var banner = gutil.template('/**\n' +
		' * <%= pkg.name %>\n' +
		' * @version v<%= pkg.version %> - <%= today %>\n' +
		' * @link <%= pkg.homepage %>\n' +
		' * @author <%= pkg.author.name %> (<%= pkg.author.email %>)\n' +
		' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
		' */\n', {file: '', pkg: pkg, today: new Date().toISOString().substr(0, 10)})

	// Build unified package
	gulp.src(src.cwd + '/vue-jade-editor.js')
		.pipe(concat.header('(function(window, document, undefined) {\n'))
		.pipe(concat.footer('\n\n})(window, document);\n'))
		.pipe(concat.header(banner))
		.pipe(gulp.dest(src.dist))
		.pipe(rename(function(path) { path.extname = '.min.js'; }))
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat.header(banner))
		.pipe(gulp.dest(src.dist))

})

//watch
gulp.task('watch',  function () {

	watch([src.cwd + '/*.js', __dirname + '/package.json'], function() {
		runSequence('ugly')
	})

})


// TEST
var karma = require('karma').server

gulp.task('karma:unit', function() {
	karma.start({
		configFile: path.join(__dirname, 'test/unit/karma.conf.js'),
		browsers: ['PhantomJS'],
		reporters: ['progress'],
		singleRun: true
	}, function(code) {
		gutil.log('Karma has exited with ' + code)
		process.exit(code)
	})
})

gulp.task('test', ['karma:unit'])
gulp.task('build', ['dist'])
gulp.task('test', ['karma:unit'])
gulp.task('default', ['watch'])
gulp.task('dist', ['ugly'])
gulp.task('dt', ['dist', 'test'])

