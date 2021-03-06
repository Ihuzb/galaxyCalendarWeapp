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
        return phase >= 0.75 ? 'π' : phase >= 0.5 ? 'π' : phase >= 0.25 ? 'π' : 'π'
    },
    formattingGalaxyAzimuth: (azimuth = 0, code = 0) => {
        if (code == 0) {
            return ''
        }
        let trueAzimuth = azimuth + 180;
        switch (true) {
            case trueAzimuth >= 360 || trueAzimuth <= 0:
                return 'ε';
                break;
            case trueAzimuth >= 315:
                return 'θ₯Ώε';
                break;
            case trueAzimuth >= 270:
                return 'θ₯Ώ';
                break;
            case trueAzimuth >= 225:
                return 'θ₯Ώε';
                break;
            case trueAzimuth >= 180:
                return 'ε';
                break;
            case trueAzimuth >= 135:
                return 'δΈε';
                break;
            case trueAzimuth >= 90:
                return 'δΈ';
                break;
            case trueAzimuth >= 45:
                return 'δΈε';
                break;
        }
    },
}