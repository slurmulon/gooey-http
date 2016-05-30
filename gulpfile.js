'use strict';

var gulp  = require('gulp'),
    babel = require('gulp-babel'),
    shell = require('gulp-shell')

gulp.task('default', ['compile'])

gulp.task('clean', shell.task(['rm -rf lib']))

gulp.task('compile', ['clean'], function() {
  return gulp.src(['*.js'], {cwd: 'src', read: true})
  .pipe(babel())
  .pipe(gulp.dest('lib'))
})

gulp.task('test', ['compile'], shell.task(['node ./node_modules/.bin/mocha --reporter nyan --compilers js:babel-core/register test']))

gulp.task('coverage', ['compile'], shell.task(['./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --compilers js:babel/register']))
