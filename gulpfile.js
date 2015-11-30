/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');

gulp.task('jshint', function() {
    gulp.src('./client/assets/js/*')
        .pipe(jshint('./client/.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
    gulp.src(['./server/app.js', './server/routes/*', './server/public/config/*'])
        .pipe(jshint('./server/.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', function(){
    gulp.run('jshint');
});