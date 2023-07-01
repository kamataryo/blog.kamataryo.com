const tj = require('@mapbox/togeojson')
const fs = require('fs')
const DOMParser = require('xmldom').DOMParser;

const gpx = new DOMParser().parseFromString(fs.readFileSync(process.argv[2], 'utf8'));

const geojson = tj.gpx(gpx)

// Garmin GPX result
// [
//   {
//     type: 'Feature',
//     properties: {
//       name: '赤穂市 ｶﾔｯｸ',
//       type: 'whitewater_rafting_kayaking',
//       time: '2020-10-07T23:05:14.000Z',
//       coordTimes: [Array]
//     },
//     geometry: { type: 'LineString', coordinates: [Array] }
//   }
// ]

const mabikiFilter = (_0, index, self) => index === 0 || index === self.length - 1 || index % 5 === 0
const noAltMapper = ([lng, lat, alt]) => [lng, lat]
geojson.features[0].properties.coordTimes = geojson.features[0].properties.coordTimes.filter(mabikiFilter)
geojson.features[0].geometry.coordinates = geojson.features[0].geometry.coordinates.filter(mabikiFilter)
geojson.features[0].geometry.coordinates = geojson.features[0].geometry.coordinates.map(noAltMapper)

const startFeature = {
    type: 'Feature',
    properties: {
        title: '始点'
    },
    geometry: {
        type: 'Point',
        coordinates: geojson.features[0].geometry.coordinates[0]
    }
}
const endFeature = {
    type: 'Feature',
    properties: {
        title: '終点'
    },
    geometry: {
        type: 'Point',
        coordinates: geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1]
    }
}

geojson.features = [startFeature, endFeature, ...geojson.features]

process.stdout.write(JSON.stringify(geojson, null, 2 ))
