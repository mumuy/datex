## getTime() 返回时间戳
```js
DateX().getTime()
// => 1670768193313
```

## clone() 返回克隆对象
```js
DateX().clone()
```

## toDate() 返回原生Date对象
```js
DateX().toDate()
// => Sun Dec 11 2022 22:20:20 GMT+0800 (中国标准时间)
```

## toObject() 返回时间字段对象
```js
DateX().toDate()
// => {
	year:2022,
	month:12,
	day:11,
	hour:22,
	minute:23,
	second: 14,
	millsecond:612,
	timestamp:1670768594612,
	week:0
}
```

## format(pattern) 返回格式化时间
```js
DateX(2022,10,1).format('YYYY-MM-DD HH:mm:ss')
// => 2022-10-01 00:00:00

DateX(1671761818503).format('YYYY/MM/DD')
// => 2022/12/23
```

## set(name,value) 设置某字段值
```js
DateX(2022,10,1).set('year',2020).format()
// => 2020-10-01 00:00:00
```

## change(name,value) 增减某字段值
```js
DateX(2022,10,1).change('year',1).format()
// => 2022-10-01 00:00:00
```

## startOf(name) 获取某字段起始时
```js
DateX(2022,10,10).startOf('month').format()
// => 2022-10-01 00:00:00
```

## endOf(name) 获取某字段末尾时
```js
DateX(2022,10,10).endOf('month').format()
// => 2022-10-31 23:59:59
```

## get(name) 返回某字段值
```js
DateX(2022,10,1).get('year')
// => 2022
```

## diff(name,dateStr|DateX) 返回某字段差值
```js
DateX('1949-10-01').diff('month','2022-12-01')
// => -878
```
