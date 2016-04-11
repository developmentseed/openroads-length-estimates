'use strict';
// This script uses length estimates from OSM and estimates from DPWH
// to calculate the national and local road length by admin area.
//
// The output is a file with an array of objects per admin area & estimate type
// [
//   {
//     "id": 17781561002,
//     "value": 0,
//     "measure": "national"
//   },
//   {
//     "id": 17781561002,
//     "value": 0,
//     "measure": "local"
//   },
//   ...
// ]

var _ = require('lodash');
var fs = require('fs');
var osmEstimates = require('./data/osm-lengths.json');
var dpwhEstimates = require('./data/dpwh-lengths.json');

// National length estimates from DPWH
var dpwhLengths = [];
_(dpwhEstimates).forEach((o, i) => {
  dpwhLengths.push({
    id: Number(i),
    value: o.totalLength,
    measure: 'national'
  });
});

// Local lengths are calculated by subtracting DPWH estimates
// from the OSM estimates
var localLengths = [];
_(osmEstimates).forEach((o, i) => {
  // o.totalLength = length estimate from OSM for a particular area
  // dpwhEstimates[i].totalLength = length estimate from DPWH for the area
  let e = o.totalLength - dpwhEstimates[i].totalLength;
  localLengths.push({
    id: Number(i),
    value: e < 0 ? 0 : e,
    measure: 'local'
  });
});

const finalLengths = dpwhLengths
  .concat(localLengths);

fs.writeFile('./data/length-estimates.json', JSON.stringify(_.sortBy(finalLengths, 'id')));
