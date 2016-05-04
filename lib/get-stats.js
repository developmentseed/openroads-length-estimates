'use strict';

const fs = require('fs');
const tileReduce = require('tile-reduce');
const path = require('path');

const ZOOM_LEVEL = 12;
const DATA_DIRECTORY = path.join(__dirname, '../data/export');
const OPT_DIRECTORY = path.join(__dirname, '../data/source');

function getStats (roadType, cb) {
  // This script is used to calculate national and local lengths, both of which
  // have their own set of config.
  const options = {
    'national': {
      exportFn: 'dpwh-lengths',
      layerName: 'dpwh',
      mbtiles: 'dpwh.mbtiles'
    },
    'local': {
      exportFn: 'osm-lengths',
      layerName: 'osm_ph',
      mbtiles: 'philippines.mbtiles'
    }
  };

  if (options[roadType]) {
    var config = options[roadType];
  } else {
    let err = `${roadType} is not a correct road type.`;
    return cb(err);
  }

  // For countries we only add the bbox, not the full geometry
  const country = require(path.join(OPT_DIRECTORY, 'or_Country-bbox.json'));
  const regions = require(path.join(OPT_DIRECTORY, 'or_Region.json'));
  const provinces = require(path.join(OPT_DIRECTORY, 'or_Province.json'));
  const municipalities = require(path.join(OPT_DIRECTORY, 'or_Municipality.json'));
  const barangays = require(path.join(OPT_DIRECTORY, 'or_Barangay.json'));

  const areas = country.features
        .concat(regions.features)
        .concat(provinces.features)
        .concat(municipalities.features)
        .concat(barangays.features);

  let lengths = {};
  areas.forEach(function (area) {
    lengths[area.properties.ID_OR] = { totalLength: 0 };
  });

  let writer = fs.createWriteStream(path.join(DATA_DIRECTORY, `./${config.exportFn}.json`));

  tileReduce({
    zoom: ZOOM_LEVEL,
    map: path.join(__dirname, './get-stats-for-tile.js'),
    maxWorkers: 2,
    sources: [{
      name: config.layerName,
      mbtiles: path.join(OPT_DIRECTORY, `./${config.mbtiles}`)
    }],
    mapOptions: {
      type: roadType
    }
  })
  .on('reduce', function (statsAndTasks) {
    // Process lengths
    let stats = statsAndTasks.stats;
    Object.keys(stats).forEach(function (area) {
      lengths[area] = sumLengths(lengths[area], stats[area].lengths);
    });
  })
  .on('end', function () {
    writer.write(`${JSON.stringify(lengths)}\n`);
    writer.end();
    console.log('Success!');
    cb();
  });
}

function sumLengths (areaLengths, tileLengths) {
  areaLengths.totalLength += tileLengths.totalLength;
  delete tileLengths.totalLength;

  Object.keys(tileLengths).forEach(function (property) {
    if (!(property in areaLengths)) {
      areaLengths[property] = {};
    }
    Object.keys(tileLengths[property]).forEach(function (propertyType) {
      if (!(propertyType in areaLengths[property])) {
        areaLengths[property][propertyType] = 0;
      }
      areaLengths[property][propertyType] += tileLengths[property][propertyType];
    });
  });

  return areaLengths;
}

module.exports = getStats;
