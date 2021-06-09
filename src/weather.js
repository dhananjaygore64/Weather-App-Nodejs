const Request = require('postman-request');

class Weather {
    constructor() { }
    get_weather({ latitude, longitude } = {}, callback) {
    //    use api.weatherapi.com which gives 1 million calls per month free
        const url = encodeURI(`http://api.weatherapi.com/v1/current.json?key=38fb11f68e374d95aec121246213105&q=${latitude},${longitude}&aqi=no`);
        Request({ url, json: true }, (err, response) => {
            if (err) {
                return callback({},'Can not connect to server!!!');
            } else if (response.body.error) {
                return callback({},'Cannot get weather!!!');
            }
            response.body.current.location = response.body.location.name + ' ' + response.body.location.region + ',' + response.body.location.country;
            callback(response.body.current);
        });
    }
    get_weather_forecast({ latitude, longitude } = {}, callback){

        const url = encodeURI(`http://api.weatherapi.com/v1/forecast.json?key=38fb11f68e374d95aec121246213105&q=${latitude},${longitude}&aqi=no&days=3`);
        Request({ url, json: true }, (err, response) => {
            if (err) {
                return callback({},'Can not connect to server!!!');
            } else if (response.body.error) {
                return callback({},'Cannot get weather!!!');
            }
            response.body.current.location = response.body.location.name + ' ' + response.body.location.region + ',' + response.body.location.country;
            const forecast = {
                current:response.body.current,
                forecast:response.body.forecast
            }
            callback(forecast);
        });
    }
    get_coords(place, callback) {
        const urlForCoords = encodeURI(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=pk.eyJ1IjoiZGhhbmFqYXkiLCJhIjoiY2twcGFubzgzMDBibjJvbW9maGx4aDN4MiJ9.6UiHGSS4kTzWjfbLTwlHUw&limit=1`);
       
        Request({ url: urlForCoords, json: true }, (err, response) => {
            if (err) {
                return callback({},'Can not connect to server!!!');
            } else if (response.body.features.length <= 0) {
                return callback({},'Place note found!!!');
            }
            const latitude = response.body.features[0].center[1];
            const longitude = response.body.features[0].center[0];
            const placeName = response.body.features[0].place_name;
            const latLong = { latitude, longitude , placeName}
            callback(latLong);
        });
    }
    get_location({latitude,longitude}={},callback){
        const url = encodeURI(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiZGhhbmFqYXkiLCJhIjoiY2twNW4xanBwMDNmcjJ1czI0ODN5MG4zbCJ9.2G7CKzWdxGrwCr9IKgkgRw&limit=1`);
        Request({ url, json: true }, (err, response) => {
            if (err) {
                return callback({error:'Can not connect to server!!!'});
            } else if (response.body.features.length <= 0) {
                return callback({error:'Your Location not found!!!'});
            }
            const placeName = response.body.features[0].place_name;
            callback(placeName);
        });
    }

}

module.exports = new Weather();