const shortMonthNames = [
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

const padZeros = (num: number, length: number): string => {
  let s = num.toString();
  while (s.length < length) s = '0' + s;
  return s;
};

export const Util = {
  change: (a: number, b: number): number => ((b - a) / a),
  sleep: (ms: number): Promise<void> => new Promise((resolve) => {
    setTimeout(resolve, ms);
  }),
  intervalToMs: (interval: string): number => {
    const num = parseInt(interval.substr(0, interval.length - 1));
    const identifier = interval[interval.length - 1];
  
    if (identifier === 's') return num * 1000;
    if (identifier === 'm') return num * 60 * 1000;
    if (identifier === 'h') return num * 3600 * 1000;
    if (identifier === 'd') return num * 3600 * 24 * 1000;
    if (identifier === 'w') return num * 3600 * 24 * 7 * 1000;

    throw new Error('Unable to parse interval');
  },
  durationToString: (ms: number): string => {
    if (ms < 1000) return `${ms} milliseconds`;

    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(2)} seconds`;

    const m = s / 60;
    if (m < 60) return `${m.toFixed(2)} minutes`;

    const h = m / 60;
    if (h < 24) return `${h.toFixed(2)} hours`;

    const d = h / 24;
    if (d < 7) return `${d.toFixed(2)} days`;

    const w = d / 7;
    if (w < 4) return `${w.toFixed(2)} weeks`;

    const mm = d / 30.4;
    if (mm < 12) return `${mm.toFixed(2)} months`;

    const y = d / 365;
    return `${y.toFixed(2)} years`;
  },
  avg: (nums: number[]): number => nums.reduce((a, v) => a + v, 0) / (nums.length || 1),
  sum: (nums: number[]): number => nums.reduce((a, v) => a + v, 0),
  minMax: (nums: number[]): number[] => {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (const num of nums) {
      min = Math.min(min, num);
      max = Math.max(max, num);
    }

    return [min, max];
  },
  numberToString: (num: number): string => num.toFixed(2),
  timeToString: (time: Date): string => `${time.getUTCDate()} ${shortMonthNames[time.getUTCMonth()]} ${time.getUTCFullYear()} ${padZeros(time.getUTCHours(), 2)}:${padZeros(time.getUTCMinutes(), 2)}` 
};