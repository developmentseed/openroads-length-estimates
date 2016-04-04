'use strict';
const getLengths = require('./tools/utils').getLengths;
const clip = require('./tools/clip.js');
const which = require('which-polygon');
const tilebelt = require('tilebelt');
const path = require('path');

const OPT_DIRECTORY = path.join(__dirname, './opt/data');

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

var adminIndex = which({
  'type': 'FeatureCollection',
  'features': areas
});

var featureMap = {};
areas.forEach((feature) => {
  featureMap[feature.properties.ID_OR] = {
    'type': 'Feature',
    'geometry': feature.geometry
  };
});

function unique (arr) {
  return arr.reduce(function (accum, current) {
    if (accum.indexOf(current) < 0) {
      accum.push(current);
    }
    return accum;
  }, []);
}

function findAreas (tile, adminIndex) {
  var bbox = tilebelt.tileToBBOX(tile);
  return adminIndex.bbox(bbox);
}

module.exports = function getStatsForTile (data, tile, writeData, done) {
  var areas = findAreas(tile, adminIndex);
  var areaIds = unique(areas.map((admin) => admin.ID_OR));

  // let roads = data.dpwh.dpwh.features.filter(function (feature) {
  //   return (feature.geometry.type === 'LineString');
  // });
  let roads = data.osm_ph.osm.features.filter(function (feature) {
    if (!feature.properties.highway || feature.geometry.type !== 'LineString' && feature.geometry.type !== 'MultiLineString') {
      return false;
    } else {
      return true;
    }
  });
  let stats = {};
  areaIds.forEach(function (id) {
    stats[id] = {};
    var geom = featureMap[id];
    var clippedRoads = clip(roads, geom);
    stats[id].lengths = getLengths(clippedRoads);
  });

  done(null, {stats: stats});
};
