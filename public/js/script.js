
const locationElement = document.querySelector('.info-body h5');
const tableTemp = document.querySelector('#table-temp');
const tableWs = document.querySelector('#table-ws');
const tableWd = document.querySelector('#table-wd');
const tableHumid = document.querySelector('#table-humid');
const tableCloud = document.querySelector('#table-cloud');
const tableDay = document.querySelector('#table-day');
const tableUv = document.querySelector('#table-uv');
const tableVisi = document.querySelector('#table-visi');
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let marker, map;

setTimeout(()=>{
    document.querySelector('.form').scrollIntoView({behavior: "smooth", block: "center"});
},1000);

// get weather for user's current location
navigator.geolocation.getCurrentPosition((location) => {
    const { latitude, longitude } = location.coords;
    backendCall(`weather?byCoords=1&lat=${latitude}&long=${longitude}`, (data) => {
        if (data.error) {
            return updateErrorMsg(data.error);
        }
        else {
            document.querySelector('.error-msg').style.opacity = 0;
        }
        const currentDayWeather = data.forecast[0];
        updateUserLocation(data.place);
        updateWeatherInfo(currentDayWeather.current);
        updateAnalytics(currentDayWeather.current);
        updateForecast(data.forecast);
        initMap({ latitude, longitude });
    });
}, (err) => {
    document.querySelector('.analytics').style.opacity = 0;
    document.querySelector('.forecast').style.opacity = 0;
    document.querySelector('.info').style.opacity = 0;
    const errorMsg = err.code == 1 ? err.message + ' - Please allow this app to use your location then refresh page' : err.message;
    updateErrorMsg(errorMsg);
    initMap();
    console.log(err);
});

// get weather for user specified place
document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const searchText = document.querySelector('.form input').value;
    backendCall(`/weather?address=${searchText}`, (data) => {
        if (data.error) {
            return updateErrorMsg(data.error);
        }
        else {
            document.querySelector('.error-msg').style.opacity = 0;
        }
        const currentDayWeather = data.forecast[0];
        setMapAndMarker(currentDayWeather.current.latLong);
        updateUserLocation(currentDayWeather.current.address);
        updateWeatherInfo(currentDayWeather.current);
        updateAnalytics(currentDayWeather.current);
        updateForecast(data.forecast);
    });
});

// communicate with backend/server
function backendCall(url, callback) {
    document.querySelector('.analytics').style.opacity = 0;
    document.querySelector('.forecast').style.opacity = 0;
    document.querySelector('.info').style.opacity = 0;
    updateStatus('Loading......');
    fetch(url).then((response) => response.json()).then((data) => callback(data));
}
function updateUserLocation(place) {
    const html = `<span><img src="/img/pin.png" class="marker me-2"></span>
                 <h5 class="mb-0 d-inline">${place}</h5>`;
    document.querySelector('.info-body').innerHTML = html;
}
function updateStatus(status) {
    document.querySelector('.info-body').innerHTML = `<h4 class="py-2">${status}</h4>`;
}
function updateErrorMsg(error) {
    const errorMsg = document.querySelector('.error-msg');
    errorMsg.style.opacity = 1;
    errorMsg.innerText = error;
}
function updateWeatherInfo(data) {
    document.querySelector('.info').style.opacity = 1;
    const temp = data.temperature;
    const weatherIcon = data.weatherIcon;
    const feelsLike = data.feelsLike;
    const description = data.description;

    const html = `<div class="info-body fs-6 pb-2 pt-1">
                    <div>
                        <img src="${weatherIcon}" class="info-icon" width="4%">
                        <span class="descr-1">${description}, It is currently </span>
                        <span class="mx-2 temp actual-temp">${temp}</span> &#8451;
                        <span class="descr-2"> out. It feels like</span>
                        <span class="mx-2 temp feels-like">${feelsLike}</span> &#8451;
                    </div>
                  </div>`;
    document.querySelector('.info-body').insertAdjacentHTML('beforeend', html);
}
function updateAnalytics(data) {
    document.querySelector('.analytics').style.opacity = 1;
    tableTemp.innerText = data.temperature;
    tableWs.innerText = data.windSpeed;
    tableWd.innerText = data.windDir;
    tableHumid.innerText = data.humidity;
    tableCloud.innerText = data.cloud;
    tableVisi.innerText = data.visibility;
    tableUv.innerText = data.uv;
    tableDay.innerText = (data.day && 'Yes') || (data.day == 0 && 'No') || '';
}

function updateForecast(dataArray) {
    console.log(dataArray)
    document.querySelector('.forecast').style.opacity = 1;
    dataArray.forEach((data, index) => {
        const day = days[new Date(data.date).getDay()];
        const rain = data.chance_of_rain;
        const temp = data.max_temp;
        const sunrise = data.astro.sunrise;
        const sunset = data.astro.sunset;
        const icon = data.icon;
        const status = data.descr;
        document.querySelector(`#forecast-day${index}`).innerHTML = `<img src="${icon}">` + (index == 0 ? 'Today' : day);
        document.querySelector(`#forecast-temp${index}`).innerText = temp;
        document.querySelector(`#forecast-status${index}`).innerText = status;
        document.querySelector(`#forecast-rain${index}`).innerText = rain;
        document.querySelector(`#forecast-rise${index}`).innerText = sunrise;
        document.querySelector(`#forecast-set${index}`).innerText = sunset;
    });
}

function initMap(latLong = {}) {
    let zoom = 12;
    if (!latLong.latitude || !latLong.longitude) {
        latLong.latitude = 19.488;
        latLong.longitude = 80.818;
        zoom = 2;
    }
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGhhbmFqYXkiLCJhIjoiY2twcGFubzgzMDBibjJvbW9maGx4aDN4MiJ9.6UiHGSS4kTzWjfbLTwlHUw';
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [latLong.longitude, latLong.latitude], // starting position [lng, lat]
        zoom // starting zoom
    });
    // Create a default Marker and add it to the map.
    marker = new mapboxgl.Marker({ color: '#e34138' }).setLngLat([latLong.longitude, latLong.latitude]).addTo(map);

    map.on('click', ({ lngLat: { lat, lng } } = {}) => {
        setMapAndMarker({ latitude: lat, longitude: lng });
        backendCall(`weather?byCoords=1&lat=${lat}&long=${lng}`, (data) => {
            if (data.error) {
                return updateErrorMsg(data.error);
            }
            else {
                document.querySelector('.error-msg').style.opacity = 0;
            }
            const currentDayWeather = data.forecast[0];
            updateUserLocation(data.place);
            updateWeatherInfo(currentDayWeather.current);
            updateAnalytics(currentDayWeather.current);
            updateForecast(data.forecast);
        });
    });
}

function setMapAndMarker({ latitude, longitude } = {}) {
    if (!map || !marker || !latitude || !longitude) return;
    marker.setLngLat([longitude, latitude]);
    map.flyTo({ center: [longitude, latitude], zoom: 12 });
}