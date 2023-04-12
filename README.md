# Nodejs安装datex
```js
npm install datex.js
```


# datex方法说明

## getTime() 返回时间戳(毫秒)
```js
datex().getTime()
// => 1670768193313
```

## getUnix() 返回时间戳(秒)
```js
datex().getUnix()
// => 1670768193
```

## clone() 返回克隆对象
```js
datex().clone()
```

## toDate() 返回原生Date对象
```js
datex().toDate()
// => Sun Dec 11 2022 22:20:20 GMT+0800 (中国标准时间)
```

## toObject() 返回时间字段对象
```js
datex().toDate()
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

## toArray() 返回时间字段数值
```js
datex().toArray()
// => [2022,12,11,22,23,14,612]
```

## toString() 返回字符串
```js
datex().toDate()
// => Sun Dec 11 2022 22:20:20 GMT+0800 (中国标准时间)
```

## toISOString() 返回ISO字符串
```js
datex().toDate()
// => 2023-04-12T07:20:23.363Z
```

## format(pattern) 返回格式化时间
```js
datex(2022,10,1).format('YYYY-MM-DD HH:mm:ss')
// => 2022-10-01 00:00:00

datex(1671761818503).format('YYYY/MM/DD')
// => 2022/12/23
```

## set(name,value) 设置某字段值
```js
datex(2022,10,1).set('year',2020).format()
// => 2020-10-01 00:00:00
```

## change(name,value) 增减某字段值
```js
datex(2022,10,1).change('year',1).format()
// => 2022-10-01 00:00:00
```

## startOf(name) 获取某字段起始时
```js
datex(2022,10,10).startOf('month').format()
// => 2022-10-01 00:00:00
```

## endOf(name) 获取某字段末尾时
```js
datex(2022,10,10).endOf('month').format()
// => 2022-10-31 23:59:59
```

## get(name) 返回某字段值
```js
datex(2022,10,1).get('year')
// => 2022
```

## diffWith(dateStr|datex,name) 返回某字段差值
```js
datex('1949-10-01').diffWith('2022-12-01','month')
// => -878
```

## isBefore(dateStr|datex,name) 是否在某个时间点之前
```js
datex('2008-08-08').isBefore('2022-02-02')
// => true
```

## isAfter(dateStr|datex,name) 是否在某个时间点之后
```js
datex('2008-08-08').isAfter('2022-02-02')
// => false
```

## isSame(dateStr|datex,name) 是否和某个时间点相等
```js
datex('2008-08-08').isSame('2022-02-02')
// => false
```

## isBetween(dateStr|datex,dateStr|datex,name) 是否在两个时间点之间
```js
datex('2008-08-08').isBetween('2003-07-13','2022-02-02')
// => true
```