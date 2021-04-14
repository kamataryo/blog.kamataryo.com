const fs = require('fs')

const geojson = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const mabikiFilter = (_0, index, self) => index ===0 || index === self.length - 1 || index % 20 === 0
geojson.features[0].geometry.coordinates = geojson.features[0].geometry.coordinates.filter(mabikiFilter)

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

geojson.features.forEach((feature, index) => {
    if(!feature.properties) {
        geojson.features[index] = {}
    }
})

process.stdout.write(JSON.stringify(geojson, null, 2 ))
