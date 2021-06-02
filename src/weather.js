const Request = require('postman-request');

class Weather {
    constructor() { }
    get_weather({ latitude, longitude } = {}, callback) {
        // const weatherStackApiUrl = `http://api.weatherstack.com/current?access_key=fe8974a958b458d3b6013c17c2a50d10&query=${latitude},${longitude}`;
    //    use api.weatherapi.com which gives 1 million calls per month free
        const url = encodeURI(`http://api.weatherapi.com/v1/current.json?key=38fb11f68e374d95aec121246213105&q=${latitude},${longitude}&aqi=no`);
        Request({ url, json: true }, (err, response) => {
            if (err) {
                console.log(err);
                return callback({},'Can not connect to server!!!');
            } else if (response.body.error) {
                console.log('Cannot get weather!!!');
                return callback({},'Cannot get weather!!!');
            }
            response.body.current.location = response.body.location.name + ' ' + response.body.location.region + ',' + response.body.location.country;
            callback(response.body.current);
        });
    }
    get_coords(place, callback) {
        const urlForCoords = encodeURI(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=pk.eyJ1IjoiZGhhbmFqYXkiLCJhIjoiY2twNW4xanBwMDNmcjJ1czI0ODN5MG4zbCJ9.2G7CKzWdxGrwCr9IKgkgRw&limit=1`);
       
        Request({ url: urlForCoords, json: true }, (err, response) => {
            if (err) {
                console.log(err);
                return callback({},'Can not connect to server!!!');
            } else if (response.body.features.length <= 0) {
                console.log('Place note found!!!');
                return callback({},'Place note found!!!');
            }
            const latitude = response.body.features[0].center[1];
            const longitude = response.body.features[0].center[0];
            const placeName = response.body.features[0].place_name;
            const latLong = { latitude, longitude , placeName}
            callback(latLong);
        });
    }

}
// const location = process.argv[2];
// if (location) {
//     const weather = new Weather();
//     weather.get_coords(location, (latLong) => {
//         console.log(latLong);
//         weather.get_weather(latLong, (weather) => {
//             console.log(`${weather.weather_descriptions}, It is currently ${weather.temperature} degrees out. It feels like ${weather.feelslike} degrees out.`);
//         });
//     });
// }
// else {
//     console.log('Please provide a location !!!');
// }

module.exports = new Weather();