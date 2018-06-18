var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var imagemin = require('gulp-imagemin');
var useref = require('gulp-useref');
var del = require('del');
var uncss = require('gulp-uncss');
var cache = require('gulp-cache');
var concat = require('gulp-concat');

// TASK LIST FOR BUILDING DIST VERSION

  // Deletes the dist folder
  gulp.task('clean:dist', function() {
    return del.sync('dist');
  })

  // Compiles the SCSS sheets code into CSS in SRC
  gulp.task('sass', function(){
    return gulp.src('src/sass/style.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(gulp.dest('src/css'))
      .pipe(browserSync.reload({
        stream: true
      }))
  });

  // Goes though all the CSS files in SRC/CSS and strips out anything thats not being used
  gulp.task('uncss', function () {
    return gulp.src(['src/css/*.css'])
      .pipe(uncss({
          html: ['src/**/*.html'],
      }))
      .pipe(gulp.dest('src/css/uncss/'));
  });

  // Concentrates the <link> and <script> files in index.html and outputs to a single file
  gulp.task('useref', function(){
    return gulp.src('src/**/*.html')
      .pipe(useref())
      .pipe(gulp.dest('dist'))
  });

  // Image compressor
  gulp.task('images', function(){
    return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/img'))
  });

  // Takes the files from src/css/uncss and creates style.css in dist
  gulp.task('concat', function() {
    return gulp.src('src/css/uncss/*.css')
      .pipe(concat('style.css'))
      .pipe(gulp.dest('dist/css/'));
  });

  // Runs the entire build process to create a finished dist folder
  gulp.task('build', function (callback) {
    runSequence('clean:dist', 'sass', 'uncss', 
      ['useref','images'],
      'concat')
  })


// TASKS FOR RUNNING LOCAL BUILD

  // Runs browsersync on src folder
  gulp.task('browserSync', function() {
    browserSync.init({
      server: {
        baseDir: 'src'
      },
    })
  })

  // Watches CSS and JS files for changes and reloads browser
  gulp.task('watch', ['browserSync', 'sass'], function (){
    gulp.watch('src/sass/**/*.scss', ['sass']); 
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('src/*.html', browserSync.reload); 
    gulp.watch('src/js/**/*.js', browserSync.reload); 
  });

  // Main Gulp Task
  gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
      callback
    )
  })


