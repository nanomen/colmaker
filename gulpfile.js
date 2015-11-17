'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('uglify', function(){

	return gulp.src('src/js/*.js')
			.pipe(uglify())
			.pipe(rename({
		      extname: '.min.js'
		    }))
    		.pipe(gulp.dest('dest/js'));

});

gulp.task('default', ['uglify']);