'use strict';

const fs = require('fs');
const tileReduce = require('tile-reduce');
const path = require('path');

const ZOOM_LEVEL = 12;
const DATA_DIRECTORY = path.join(__dirname, './data');
const OPT_DIRECTORY = path.join(__dirname, './opt/data');

if (process.env.NODE_ENV !== 'test') {
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

  let writer = fs.createWriteStream(path.join(DATA_DIRECTORY, './osm-lengths.json'));
  // let writer = fs.createWriteStream(path.join(DATA_DIRECTORY, './dpwh-lengths.json'));

  tileReduce({
    zoom: ZOOM_LEVEL,
    map: path.join(__dirname, './get-stats-for-tile.js'),
    maxWorkers: 2,
    sources: [{
      // name: 'dpwh',
      // mbtiles: path.join(OPT_DIRECTORY, './dpwh.mbtiles')
      name: 'osm_ph',
      mbtiles: path.join(OPT_DIRECTORY, './philippines.mbtiles')
    }]
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

module.exports = {
  sumLengths: sumLengths
};
