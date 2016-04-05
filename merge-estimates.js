'use strict';

var _ = require('lodash');
var fs = require('fs');
var osmEstimates = require('./data/osm-lengths.json');
var dpwhEstimates = require('./data/dpwh-lengths.json');

var dpwhLengths = [];
_(dpwhEstimates).forEach((o, i) => {
  dpwhLengths.push({
    id: Number(i),
    value: o.totalLength,
    measure: 'national'
  });
});

var osmLengths = [];
_(osmEstimates).forEach((o, i) => {
  osmLengths.push({
    id: Number(i),
    value: o.totalLength,
    measure: 'full-osm'
  });
});

// Local lengths are calculated by subtracting DPWH estimates
// from the OSM estimates
var localLengths = [];
_(osmEstimates).forEach((o, i) => {
  localLengths.push({
    id: Number(i),
    value: o.totalLength - dpwhEstimates[i].totalLength,
    measure: 'local'
  });
});

const finalLengths = dpwhLengths
  .concat(osmLengths)
  .concat(localLengths);

fs.writeFile('./data/length-estimates.json', JSON.stringify(_.sortBy(finalLengths, 'id')));
