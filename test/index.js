'use strict';
var test = require('tape');
var datex = require('..');

test('[Test]', function (t) {
    t.deepEqual(datex('2008-08-08').getTime(),1218124800000);
    t.deepEqual(datex('20080808').getTime(),1218124800000);
    t.deepEqual(datex(2022,10,1).format('YYYY年MM月DD日'),'2022年10月01日');
    t.deepEqual(datex(2022,10,1).set('year',2020).format(),'2020-10-01 00:00:00');
    t.deepEqual(datex(2022,10,1).change('year',1).format(),'2023-10-01 00:00:00');
    t.deepEqual(datex(2022,10,10).startOf('month').format(),'2022-10-01 00:00:00');
    t.deepEqual(datex(2022,10,10).endOf('month').format(),'2022-10-31 23:59:59');
    t.deepEqual(datex('2008-08-08 20:00').change('hour',0.5).format('HH:mm'),'20:30');
    t.deepEqual(datex(2008,8,8,23,45,45).get('hour'),23);
    t.deepEqual(datex('1949-10-01').diffWith('2022-12-01','month'),-878);
    t.end();
});
