# OpenRoads Length Estimates
Calculates road estimates for the Philippines for use in OpenRoads. The script uses tile-reduce to process OSM data and national road data from DPWH to calculate the road length by administrative area.

The polygons with administrative boundaries that this project uses to clip the road network, are stored in the [OpenRoads Boundaries repo](https://github.com/opengovt/openroads-boundaries).

## How to use
Run `npm install` if it is the first time you run the script. To calculate the OSM and DPWH lengths, run:

```
npm start
```

By default, this script will spin up 2 workers to perform the calculations. Depending on the amount of cores available, you may want to increase the amount of workers in `lib/get-stats.js`.

## Methodology
The final estimates are stored in a JSON file with the following structure:

```json
  {
    "id": "1000000000",
    "value": 1763.386450711357,
    "measure": "national"
  },
  {
    "id": "1000000000",
    "value": 11882.348785942457,
    "measure": "full-osm"
  },
  {
    "id": "1000000000",
    "value": 10118.9623352311,
    "measure": "local"
  }
```

### national
The national road estimates are calculated from the DPWH shapefile `Surface Type.shp`. It sums up the lengths of all the roads in a given administrative area.

### local
These estimates are calculated from the Philippine country extract on [OMS QA tiles](https://osmlab.github.io/osm-qa-tiles/country.html). It sums up all the linestrings that are tagged with a `highway` tag.

### local
The local road estimates are calculated by subtracting the national estimate from the full-osm estimate.
