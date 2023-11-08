import datex from './module/factory';
import baseLoader from './module/method/base';
import computeLoader from './module/method/compute';
import compareLoader from './module/method/compare';
import durationLoader from './module/method/duration';
import languageLoader from './module/method/language';
import timezoneLoader from './module/method/timezone';

// 功能加载
[
    baseLoader,
    computeLoader,
    compareLoader,
    durationLoader,
    languageLoader,
    timezoneLoader
].forEach(datex.extend);

export default datex;
