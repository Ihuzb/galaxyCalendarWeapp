'use strict';
let moment = require("moment");

// shortcuts for easier to read formulas

var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) {
    return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
}

function toDays(date) {
    return toJulian(date) - J2000;
}


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) {
    return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
}

function declination(l, b) {
    return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
}

function azimuth(H, phi, dec) {
    return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
}

function altitude(H, phi, dec) {
    return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
}

function siderealTime(d, lw) {
    return rad * (280.16 + 360.9856235 * d) - lw;
}

function astroRefraction(h) {
    if (h < 0) // the following formula works for positive altitudes only.
        h = 0; // if h = -0.08901179 a div/0 would occur.

    // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

function solarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}

// 交集
function isIntersect(arr1, arr2) {
    let start = [Math.min(...arr1), Math.min(...arr2)];//区间的两个最小值
    let end = [Math.max(...arr1), Math.max(...arr2)];//区间的两个最大值
    return {isShow: Math.max(...start) <= Math.min(...end), time: [Math.max(...start), Math.min(...end)]};//最大值里的最小值
                                                                                                          // 是否
                                                                                                          // 小于等于
                                                                                                          // 最大值的最小值
}

// utf时间转换
function timeMap(info) {
    if (Array.isArray(info)) {
        info = info.map(v => ({date: moment(v).format("YYYY-MM-DD HH:mm:ss"), unix: moment(v).valueOf()}))
    } else {
        for (let key in info) {
            let time = moment(info[key])
            info[key] = {date: time.format("YYYY-MM-DD HH:mm:ss"), unix: time.valueOf()}
        }
    }
    return info
}


var SunCalc = {};


//查询最佳银河观测时间
SunCalc.getTrueGalaxyTimes = (date = new Date(), lat, lng) => {
    if (!lat || !lng) return {};
    const dateFormat = 'YYYY-MM-DD';
    let now = moment(date).format(dateFormat), now1 = moment(date).add(1, 'd').format(dateFormat);
    // 目的地经纬度坐标度数
    var allTime = SunCalc.getTimes(new Date(now), lat, lng);
    var allTimeT = SunCalc.getTimes(new Date(now1), lat, lng);
    //  rise：银河升起 mid：银河90°时间  set：银河降落
    let galaxyTime = SunCalc.getGalaxyTimes(new Date(now), lat, lng);
    let galaxyTimeT = SunCalc.getGalaxyTimes(new Date(now1), lat, lng);
    //  rise:月亮升起 set:月亮落下
    let moonTime = SunCalc.getMoonTimes(new Date(now), lat, lng);
    let moonTimeT = SunCalc.getMoonTimes(new Date(now1), lat, lng);
    // 黑夜开始
    let {night} = allTime;
    // 黑夜结束
    let {nightEnd} = allTimeT;
    // 隔天月落
    let {rise: moonRiseT, set: moonSetT} = moonTimeT;
    // 当天月落
    let {rise: moonRise = moonRiseT, set: moonSet = moonSetT} = moonTime;
    // 当前银河
    let {rise: galaxyRise, set: galaxySet} = galaxyTime;
    // 隔天银河
    let {rise: galaxyRiseT, set: galaxySetT} = galaxyTimeT;

    // console.log("夜晚开始：", night.date, "夜晚结束：", nightEnd.date)
    // console.log("月升：", moonRise.date, "隔天月升：", moonRiseT ? moonRiseT.date : moonRise.date)
    // console.log("月落：", moonSet.date, "隔天月落：", moonSetT.date)
    // console.log("银河升：", galaxyRise.date, "隔天银河升：", galaxyRiseT.date)
    // console.log("银河落：", galaxySet.date, "隔天银河落：", galaxySetT.date)

    let start = galaxyRise, end = galaxySet, moonStart = moonRise, moonEnd = moonSet;
    // 获取正确月落时间
    // 如果当天月出小于当天月落 说明月落再第二天
    if (moonRise.unix > moonSet.unix) {
        moonEnd = moonSetT
    } else if (nightEnd.unix >= moonRiseT.unix) {
        moonStart = moonRiseT
        moonEnd = moonSetT
    }
    // 获取正确银河落时间
    // 如果当前银河出大于当日银河落  说明银河落再第二天
    if (galaxyRise.unix > galaxySet.unix) {
        end = galaxySetT
    } else if (nightEnd.unix >= galaxyRiseT.unix) {
        start = galaxyRiseT
        end = galaxySetT
    }
    //console.log("银河开始结束时间：", start.date, end.date)
    //console.log("夜晚开始结束时间：", night.date, nightEnd.date,)

    // 银河出现时间是否于黑夜重合
    let {isShow, time} = isIntersect([night.unix, nightEnd.unix], [start.unix, end.unix]);

    let timeSE = {code: 1};
    // 今夜是否出现银河
    if (isShow) {
        // 获得夜晚可见时间段
        let [start, end] = timeMap(time);
        if (start.unix <= moonStart.unix && moonStart.unix <= end.unix) {
            timeSE["start"] = start;
            timeSE["end"] = moonStart;
            // console.log("适宜观测1", `时间段：${start.date}~${moonStart.date}`);
        } else if (start.unix >= moonEnd.unix) {
            timeSE["start"] = start;
            timeSE["end"] = end;
            // console.log("适宜观测2", `时间段：${start.date}~${end.date}`);
        } else if (end.unix <= moonStart.unix) {
            timeSE["start"] = start;
            timeSE["end"] = end;
            // console.log("适宜观测4", `时间段：${start.date}~${moonStart.date}`);
        } else if (start.unix <= moonEnd.unix && moonEnd.unix <= end.unix) {
            timeSE["start"] = moonEnd;
            timeSE["end"] = end;
            // console.log("适宜观测3", `时间段：${moonEnd.date}~${end.date}`);
        } else {
            // console.log("不适宜观测1")
            timeSE["code"] = 0;
        }
    } else {
        // console.log("不适宜观测2")
        timeSE["code"] = 0;
    }
    if (timeSE.code == 1) {
        var a = moment(timeSE.start.date);
        var b = moment(timeSE.end.date);
        timeSE["hours"] = (b.diff(a, 'hours', true)).toFixed(2);
    }
    return timeSE
}

// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,
        d = toDays(date),

        c = sunCoords(d),
        H = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise', 'sunset'],
    [-0.3, 'sunriseEnd', 'sunsetStart'],
    [-6, 'dawn', 'dusk'],
    [-12, 'nauticalDawn', 'nauticalDusk'],
    [-18, 'nightEnd', 'night'],
    [6, 'goldenHourEnd', 'goldenHour']
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) {
    return Math.round(d - J0 - lw / (2 * PI));
}

function approxTransit(Ht, lw, n) {
    return J0 + (Ht + lw) / (2 * PI) + n;
}

function solarTransitJ(ds, M, L) {
    return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
}

function hourAngle(h, phi, d) {
    return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
}

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date and latitude/longitude

SunCalc.getTimes = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];

        Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return timeMap(result);
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l = L + rad * 6.289 * sin(M), // longitude
        b = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,
        d = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec),
        // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    h = h + astroRefraction(h); // altitude correction for refraction

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
            cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return timeMap(result);
};

SunCalc.getGalaxyPosition = function (date, lat, lng) {
    var lw = rad * -lng,
        phi = rad * lat,
        d = toDays(date),

        c = {dec: -28.9333333 * rad, ra: 266.5 * rad},
        H = siderealTime(d, lw) - c.ra;
    let h = altitude(H, phi, c.dec);
    h = h + astroRefraction(h);
    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h
    };
};

SunCalc.getGalaxyTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getGalaxyPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getGalaxyPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getGalaxyPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};
    if (rise && set) result.mid = hoursLater(t, (rise + set) / 2);
    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return timeMap(result);
};

export default SunCalc;
// module.exports = SunCalc;