const path = require("path");
const hbs = require("hbs");
const express = require("express");
const weather = require("./weather");

const app = express();
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
	if (!req.query.address) {
		return res.send({ error: "Please provise address" });
	}
	weather.get_coords(req.query.address, (latLong, error) => {
		if (error) return res.send({ error });
		weather.get_weather(latLong, (weather, error) => {
			if (error) return res.send({ error });
			// const description = weather.weather_descriptions;
			// const temperature = weather.temperature;
			// const feelsLike = weather.feelslike;
			const description = weather.condition.text;
			const temperature = weather.temp_c;
			const feelsLike = weather.feelslike_c;
			const forecast = `${description}, It is currently ${temperature} degrees out. It feels like ${feelsLike} degrees out.`;
			// const weatherIcon = weather.weather_icons[0];
			const weatherIcon = weather.condition.icon;
			res.send({
				description,
				temperature,
				feelsLike,
				address: latLong.placeName,
				forecast,
				weatherIcon,
			});
		});
	});
});
app.get("*", (req, res) => {
	res.render("404");
});
app.listen(3001, () => console.log("Server is up and running on 3001 port!!"));
