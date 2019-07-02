
'use strict';

const dogeSeed = require('doge-seed');

let veryDoge = dogeSeed();
veryDoge = veryDoge.replace(/\s+/g, '-').toLowerCase();

module.exports.veryDoge = veryDoge;
