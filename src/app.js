const path = require("path");
const hbs = require("hbs");
const express = require("express");
const weather = require("./weather");

const app = express();
const port = process.env.PORT || 3001;
app.set("view engine", "hbs");

// necessary to load partials folder partials means component
const partialsPath = path.join(__dirname, "../views/partials");
hbs.registerPartials(partialsPath);

// ** Use public directory for serving requests
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath)); // set the public directory to use resources from that dir

// ** Routing
app.get("", (req, res) => {
    res.render("index", {
        title: "Weather",
        name: "Dhananjay Gore",
        message: "Weather information here",
    });
});
app.get("/help", (req, res) => {
    res.render("help", { title: "Help", name: "Dhananjay Gore" });
});
app.get("/about", (req, res) => {
    res.render("about", { title: "About", name: "Dhananjay Gore" });
});
app.get("/weather", (req, res) => {
    if (!req.query.byCoords && !req.query.address) {
        return res.send({ error: "Please provise location" });
    } else if (req.query.byCoords && (!req.query.lat || !req.query.long)) {
        return res.send({ error: "Please provise correct co-ordinates" });
    }
    // Request for getting place name
    if (req.query.byCoords) {
        const latitude = req.query.lat;
        const longitude = req.query.long;
        return weather.get_location({ latitude, longitude }, (place) => {
            if (place.error) return res.send(place);
            weatherApiCall({ latitude, longitude }, (weatherDataObj = {}, error) => {
                if (error) return res.send({ error });
                weatherDataObj.place = place;
                res.send(weatherDataObj);
            })
        });
    }
    // Request for getting Geo co-ordinates
    weather.get_coords(req.query.address, (latLong, error) => {
        if (error) return res.send({ error });
        weatherApiCall(latLong, (weatherDataObj = {}, error) => {
            if (error) return res.send({ error });
            res.send(weatherDataObj);
        });
    });
});
app.get("*", (req, res) => {
    res.render("404");
});

function weatherApiCall(latLong, callback) {
    weather.get_weather_forecast(latLong, (weather, error) => {
        if (error) return callback(null, error);
        const current = weather.current;
        let forecast = [];
        weather.forecast.forecastday.forEach((day, index) => {
            let dayObj = {
                date: day.date,
                date_epoch: day.date_epoch,
                max_temp: day.day.maxtemp_c,
                descr: day.day.condition.text,
                icon: day.day.condition.icon,
                astro: day.astro,
                chance_of_rain: day.day.daily_chance_of_rain
            }
            if (index == 0) {
                const currentObj = {
                    description: current.condition.text,
                    temperature: current.temp_c,
                    feelsLike: current.feelslike_c,
                    address: current.location,
                    forecast: `${current.condition.text}, It is currently ${current.temp_c} degrees out. It feels like ${current.feelslike_c} degrees out.`,
                    weatherIcon: current.condition.icon,
                    windSpeed: current.wind_kph,
                    windDir: current.wind_dir,
                    humidity: current.humidity,
                    cloud: current.cloud,
                    visibility: current.vis_km,
                    uv: current.uv,
                    day: current.is_day,
                    latLong
                };
                dayObj.current = currentObj;
            }
            forecast.push(dayObj);
        });
        callback({ forecast });
    });
}

app.listen(port, () => console.log("Server is up and running on " + port + " port!!"));

