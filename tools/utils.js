'use strict';

const lineDistance = require('turf-line-distance');

module.exports = {
  getLengths: function (roads) {
    let lengths = {totalLength: 0};

    roads.forEach(function (feature) {
      let roadLength = lineDistance(feature, 'kilometers');
      lengths.totalLength += roadLength;

      // properties.forEach(function (property) {
      //   let propertyType = feature.properties[property] || 'roadTypeUndefined';
      //   if (typeof lengths[property] === 'undefined') { lengths[property] = {}; }
      //   if (typeof lengths[property][propertyType] === 'undefined') { lengths[property][propertyType] = 0; }
      //   lengths[property][propertyType] += roadLength;
      // });
    });

    return lengths;
  }
};
