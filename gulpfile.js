const fs = require('fs');
const gulp = require('gulp');

gulp.task('mini', () => {
    return gulp.src('dist/datex.min.js')
    .pipe(gulp.dest('dist/'))
});
