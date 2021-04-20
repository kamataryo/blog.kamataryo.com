// Read images and generate linestring GeoJSON as timeline

const path = require('path')
const fs = require('fs/promises')
const {ExifImage} = require('exif')

const splitDate = (datetimestring) => {
    const [datepart, timepart] = datetimestring.split(' ')
    const [year, month, day] = datepart.split(':')
    const [hour, min, sec] = timepart.split(':')
    return new Date(year, month - 1, day, hour, min, sec)
}

const degreeToDecimal = (degreeArray) => {
    const [degree, min, sec] = degreeArray
    return degree + min / 60 + sec / 3600
}

const readLatLng = (image) => {
    return new Promise((resolve, reject) => {
        try {
           new ExifImage({ image }, (error, data) => {
               if(error) {
                   console.error(error)
                   resolve(false)
               } else {

                   if(
                       data.gps &&
                       data.gps.GPSLongitude &&
                       data.gps.GPSLatitude &&
                       data.exif &&
                       data.exif.DateTimeOriginal
                    ) {
                       const timestamp = splitDate(data.exif.DateTimeOriginal).getTime()
                       const lat = degreeToDecimal(data.gps.GPSLatitude)
                       const lng = degreeToDecimal(data.gps.GPSLongitude)
                       resolve({timestamp, lat, lng})
                   } else {
                       resolve(false)
                   }
               }
           }) 
        } catch (error) {
            console.error(error)
            resolve(false)
        }
    })
}

const main = async () => {
    const arg = process.argv[2]
    const imageFolderPath = path.resolve(process.cwd(), arg)
    const images = await fs.readdir(imageFolderPath)
    const latlngs = await Promise.all(images.map(image => readLatLng(path.resolve(imageFolderPath, image))))
    latlngs.sort(({ timestamp: a }, {timestamp: b}) => b - a)
    const geojsonObject = latlngs.reduce((prev, latlng) => {
        if(latlng) {
            prev.features[0].geometry.coordinates.push([latlng.lng, latlng.lat])
        }
        return prev
    }, {
        type: "FeatureCollection",
        features: [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        }]
    })

    console.log(JSON.stringify(geojsonObject, null, 2))
}

main()