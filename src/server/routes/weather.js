const express = require("express");
const fetch = require("node-fetch");

const router = express();

function getGeo(city) {
    const geoURL = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=kamara.moses`;
    return fetch(geoURL).then(res => res.json());
}

function getWeather(lat, lng) {
    const weatherBitURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lng}&key=cda6df51d9a24b8c9d54b830f4eadb51`;
    return fetch(weatherBitURL).then(res => res.json());
}

function getPixaImage(city) {
    const pixaBayURL = `https://pixabay.com/api/?key=19853981-85155ca595da994be43f034e6&q=${city}&image_type=photo`;
    return fetch(pixaBayURL).then(res => res.json());
}

router.post("/getWeather", async (req, res) => {
    const { city } = req.body;

    const reply = {
        city,
        icon: null,
        description: "",
        highTemp: 0,
        lowTemp: 0,
        image: "",
        errors: {}
    };

    let lat, lng;

    // Call to the geonames API
    try {
        const geoData = await getGeo(city);
        console.log(geoData);
        lat = geoData.geonames[0].lat;
        lng = geoData.geonames[0].lng;
    }
    catch (e) {
        reply.errors.geoname = e.message;
    }

    // call to WeatherBit API
    if (lat && lng) {
        try {
            const weatherData = await getWeather(lat, lng);
            console.log(weatherData.data[0]);
            const { weather: { icon, description }, high_temp: highTemp, low_temp: lowTemp } = weatherData.data[0];
            reply.icon = icon;
            reply.description = description;
            reply.highTemp = highTemp;
            reply.lowTemp = lowTemp;
        }
        catch (e) {
            reply.errors.weatherBit = e.message;
        }
    }

    // call to PixaBay API
    try {
        const pixaData = await getPixaImage(city);
        console.log(pixaData.hits[0]);
        reply.image = pixaData.hits[0].webformatURL;
    }
    catch (e) {
        reply.errors.pixaBay = e.message;
    }

    console.log(reply);
    res.send(reply);
});

module.exports = router;