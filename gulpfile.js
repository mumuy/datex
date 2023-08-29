const gulp = require('gulp');
const rollup = require('rollup');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package');

// copyright
var repository = pkg.repository.url.replace(/(.+)(:\/\/.+)\.git$/,'https$2');
var now = new Date();
var date = (new Date(now.getTime()-now.getTimezoneOffset()*60000)).toISOString().substr(0,10);
var banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Copyright (c) 2022-present, ${pkg.author}
 *
 * Released under the ${pkg.license} License
 * ${repository}
 *
 * Created on: ${date}
 */`;

gulp.task('default', () => {
    return rollup.rollup({
        input: './src/datex.js',
        plugins: [
            terser()
        ]
    }).then(bundle => {
        return Promise.all([bundle.write({
            file: './dist/datex.min.js',
            format: 'umd',
            name: 'datex',
            banner
        }),
        bundle.write({
            file: './dist/datex.esm.js',
            format: 'esm',
            name: 'datex',
            banner
        })]);
    });
});
