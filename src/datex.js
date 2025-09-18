import datex from './module/factory.js';
import baseLoader from './module/method/base.js';
import computeLoader from './module/method/compute.js';
import compareLoader from './module/method/compare.js';
import durationLoader from './module/method/duration.js';
import languageLoader from './module/method/language.js';
import timezoneLoader from './module/method/timezone.js';
import parseLoader from './module/method/parse.js';

// 功能加载
[
    baseLoader,
    computeLoader,
    compareLoader,
    durationLoader,
    languageLoader,
    timezoneLoader,
    parseLoader,
].forEach(datex.extend);

export default datex;
