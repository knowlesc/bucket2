var gulp       = require('gulp'),
    eslint     = require('gulp-eslint');
    gutil      = require('gulp-util');
    sass       = require('gulp-ruby-sass'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['watch']);

gulp.task('lint', function () {
    return gulp.src('src/javascript/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-css', function() {
    return sass('src/scss/style.scss')
    .on('error', sass.logError)
    .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('build-js', function() {
    return gulp.src('src/javascript/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/javascript'));
});

gulp.task('watch', function() {
    gulp.watch('src/javascript/**/*.js', ['lint', 'build-js']);
    gulp.watch('src/scss/**/*.scss', ['build-css']);
});