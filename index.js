'use strict';

// This script acts as the bit of glue for get-stats.js, which is the real
// workhorse. It uses TileReduce to calculate the road length for OSM and
// DPWH data.

const getStats = require('./lib/get-stats.js');
const async = require('async');

async.series([
  function (cb) {
    // Calculate the local lengths
    getStats('local', cb);
  },
  function (cb) {
    // Calculate the national lengths
    getStats('national', cb);
  }
], function (err, results) {
  if (err) {
    return console.error(err);
  }
});
