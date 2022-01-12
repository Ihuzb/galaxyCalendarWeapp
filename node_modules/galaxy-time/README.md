galaxy-time
======
![npm](https://img.shields.io/npm/v/galaxy-time)

根据经纬度坐标查询天文时间和银河最佳观测时间

## 可用方法

### 查询天文时间

```javascript
SunCalc.getTimes(/*日期*/ date, /*纬度*/ latitude, /*经度*/ longitude)
```

返回一个具有以下属性的对象(每个都是一个“Date”对象):

| 属性        | 描述                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `sunrise`       | 日出(太阳的顶端出现在地平线上)|                                               |
| `sunriseEnd`    | 日出结束(太阳的底部边缘触到地平线)                                            |
| `goldenHourEnd` | 清晨黄金时间(柔和的光线，拍摄的最佳时间)结束了         |
| `solarNoon`     | 太阳正午(太阳在最高点)                              |
| `goldenHour`    | 傍晚黄金时间开始                                               |
| `sunsetStart`   | 日落开始(太阳的底部边缘触到地平线)               |
| `sunset`        | 日落(太阳消失在地平线下，傍晚民用暮色开始) |
| `dusk`          | 黄昏(航海黄昏开始)                                  |
| `nauticalDusk`  | 航海黄昏(天文黄昏开始)                     |
| `night`         | 夜晚开始(足够暗，可以进行天文观测)                 |
| `nadir`         | 最低点(夜晚最黑暗的时刻，太阳在最低的位置)       |
| `nightEnd`      | 夜晚结束(晨光开始)                        |
| `nauticalDawn`  | 航海黎明(航海黎明开始)                         |
| `dawn`          | 黎明(航海黎明结束，民用黎明开始)     |

### 查询银河最佳观测时间

```javascript
SunCalc.getTrueGalaxyTimes( /*纬度*/ latitude, /*经度*/ longitude, /*日期 default=new Date()*/ date,)
```

返回一个对象，属性`start`和`end`表示银河最佳观测的起始时间。

| 属性        | 描述                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `code`       | 状态码：1:可观测 2:不可观测|                                               |
| `start`    | 可观测开始时间，date时间，unix时间戳                                            |
| `end` | 可观测结束时间，date时间，unix时间戳              |
| `hours`     | 持续时间，单位：小时                              |

### 查询月升月落时间

```javascript
SunCalc.getMoonTimes(/*日期 default=new Date()*/ date, /*纬度*/ latitude, /*经度*/ longitude,);
```

返回一个对象，属性`rise`和`set`表示月升和月落时间。

| 属性        | 描述                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `rise`    | 月升时间，date时间，unix时间戳                                            |
| `set` | 月落时间，date时间，unix时间戳              |