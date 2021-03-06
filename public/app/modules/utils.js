import config from '../modules/config.js';

export const noop = () => null;

export const uniqueId = () =>  {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

export const makeAvatarPath = (path) => config.backendUrl + '/img/' + path;

export const urlencodeFormData = (fd) => {
    let s = '';
    const encode = (s) => {
        return encodeURIComponent(s).replace(/%20/g,'+');
    };

    for (const pair of fd.entries()) {
        if (typeof pair[1] == 'string'){
            s += (s?'&':'') + encode(pair[0])+'=' + encode(pair[1]);
        }
    }

    return s;
};

// Fisher–Yates Shuffle -- https://bost.ocks.org/mike/shuffle/
export const shuffle = (array, notShuffleIndexes = []) => {
    let m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        if (notShuffleIndexes.includes(m) || notShuffleIndexes.includes(i)) {
            continue;
        }
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
};
