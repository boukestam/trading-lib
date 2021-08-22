var shortMonthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];
var padZeros = function (num, length) {
    var s = num.toString();
    while (s.length < length)
        s = '0' + s;
    return s;
};
export var Util = {
    change: function (a, b) { return ((b - a) / a); },
    sleep: function (ms) { return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    }); },
    intervalToMs: function (interval) {
        var num = parseInt(interval.substr(0, interval.length - 1));
        var identifier = interval[interval.length - 1];
        if (identifier === 's')
            return num * 1000;
        if (identifier === 'm')
            return num * 60 * 1000;
        if (identifier === 'h')
            return num * 3600 * 1000;
        if (identifier === 'd')
            return num * 3600 * 24 * 1000;
        if (identifier === 'w')
            return num * 3600 * 24 * 7 * 1000;
        throw new Error('Unable to parse interval');
    },
    durationToString: function (ms) {
        if (ms < 1000)
            return ms + " milliseconds";
        var s = ms / 1000;
        if (s < 60)
            return s.toFixed(2) + " seconds";
        var m = s / 60;
        if (m < 60)
            return m.toFixed(2) + " minutes";
        var h = m / 60;
        if (h < 24)
            return h.toFixed(2) + " hours";
        var d = h / 24;
        if (d < 7)
            return d.toFixed(2) + " days";
        var w = d / 7;
        if (w < 4)
            return w.toFixed(2) + " weeks";
        var mm = d / 30.4;
        if (mm < 12)
            return mm.toFixed(2) + " months";
        var y = d / 365;
        return y.toFixed(2) + " years";
    },
    avg: function (nums) { return nums.reduce(function (a, v) { return a + v; }, 0) / (nums.length || 1); },
    sum: function (nums) { return nums.reduce(function (a, v) { return a + v; }, 0); },
    minMax: function (nums) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var _i = 0, nums_1 = nums; _i < nums_1.length; _i++) {
            var num = nums_1[_i];
            min = Math.min(min, num);
            max = Math.max(max, num);
        }
        return [min, max];
    },
    numberToString: function (num) { return num.toFixed(2); },
    timeToString: function (time) { return time.getUTCDate() + " " + shortMonthNames[time.getUTCMonth()] + " " + time.getUTCFullYear() + " " + padZeros(time.getUTCHours(), 2) + ":" + padZeros(time.getUTCMinutes(), 2); }
};
//# sourceMappingURL=Util.js.map