module.exports = {
    formattingTime: (dates = '') => {
        let days = new Date(dates);
        let years = days.getFullYear(),
            month = (days.getMonth() + 1).toString(),
            date = (days.getDate()).toString();
        let times = `${years}-${month.padStart(2,'0')}-${date.padStart(2,'0')}`;
        return times
    },
    formattingMoonPhase: (phase = 0) => {
        return phase >= 0.75 ? '🌗' : phase >= 0.5 ? '🌕' : phase >= 0.25 ? '🌓' : '🌑'
    },
    formattingGalaxyAzimuth: (azimuth = 0, code = 0) => {
        if (code == 0) {
            return ''
        }
        let trueAzimuth = azimuth + 180;
        switch (true) {
            case trueAzimuth >= 360 || trueAzimuth <= 0:
                return '北';
                break;
            case trueAzimuth >= 315:
                return '西北';
                break;
            case trueAzimuth >= 270:
                return '西';
                break;
            case trueAzimuth >= 225:
                return '西南';
                break;
            case trueAzimuth >= 180:
                return '南';
                break;
            case trueAzimuth >= 135:
                return '东南';
                break;
            case trueAzimuth >= 90:
                return '东';
                break;
            case trueAzimuth >= 45:
                return '东北';
                break;
        }
    },
}