import pubSub from "./pubSub.js";
import weatherMap from "./weatherMap.js";
import googleMaps from "./googleMaps.js";

(function() {
    let weather;
    let city;
    let latitude;
    let longitude;
    let userQueries = [];
    let weatherCondId;
    let skycon;

    /*DOM Elements*/

    let cityNameContainer = document.querySelector("#city");
    let longContainer = document.querySelector("#long");
    let latContainer = document.querySelector("#lat");
    let tempContainer = document.querySelector("#temp");
    let descriptionContainer = document.querySelector("#desc");
    let inputBox = document.getElementById("cityInput");
    let iconCanvas = document.querySelector("#icon");

    /*Subscribtions*/

    pubSub.subscribe("weather", data => {
        weather = data;
        weatherCondId = weather.weather[0].id;
        renderWeather();
        renderWeatherIcon();
    });

    /*Displaying data*/

    function renderWeather() {
        let apiLon = weather.coord.lon;
        let apiLat = weather.coord.lat;
        let cityName = weather.name;
        let description = weather.weather[0].description;
        let countryCode = weather.sys.country;
        let kelvinTemp = weather.main.temp;
        let displayTemp;

        function tempConverter(apiTemp) {
            let celsius = Math.floor(kelvinTemp - 273);

            if (
                countryCode == "US" ||
                countryCode == "BS" ||
                countryCode == "KY" ||
                countryCode == "LR" ||
                countryCode == "PW" ||
                countryCode == "MH" ||
                countryCode == "FM"
            ) {
                return (displayTemp = celsius * (9 / 5) + 32 + "F");
            }
            return (displayTemp = celsius + "°C");
        }

        tempContainer.innerHTML = tempConverter(kelvinTemp);
        cityNameContainer.innerHTML = cityName;
        longContainer.innerHTML = apiLon;
        latContainer.innerHTML = apiLat;
        descriptionContainer.innerHTML = description;
    }

    function renderWeatherIcon() {
        let CLEAR_IDS = 800; // day & night
        const PARTLY_CLOUDY_IDS_ARR = [802, 801];
        const CLOUDY_IDS_ARR = [803, 804];
        const FOG_IDS_ARR = [701, 711, 721, 731, 741, 751, 761, 762, 771, 781];
        const SNOW_IDS_ARR = [
            600,
            601,
            602,
            611,
            612,
            613,
            615,
            616,
            620,
            621,
            622
        ];
        const RAIN_IDS_ARR = [
            200,
            201,
            202,
            210,
            211,
            212,
            221,
            230,
            231,
            232,
            300,
            301,
            302,
            310,
            311,
            312,
            313,
            314,
            321,
            500,
            501,
            502,
            503,
            504,
            511,
            520,
            521,
            522,
            531
        ];

        let id = weatherCondId;

        if (!skycon) {
            skycon = new Skycons({ color: "white" });
            skycon.add(iconCanvas, Skycons.CLEAR);
        }

        if (PARTLY_CLOUDY_IDS_ARR.includes(id) && isLate()) {
            skycon.set("icon", Skycons.PARTLY_CLOUDY_NIGHT);
        } else if (PARTLY_CLOUDY_IDS_ARR.includes(id) && !isLate()) {
            skycon.set("icon", Skycons.PARTLY_CLOUDY_DAY);
        } else if (id == CLEAR_IDS && isLate()) {
            skycon.set("icon", Skycons.CLEAR_NIGHT);
        } else if (id == CLEAR_IDS && !isLate()) {
            skycon.set("icon", Skycons.CLEAR_DAY);
        } else if (FOG_IDS_ARR.includes(id)) {
            skycon.set("icon", Skycons.FOG);
        } else if (RAIN_IDS_ARR.includes(id)) {
            skycon.set("icon", Skycons.RAIN);
        } else if (SNOW_IDS_ARR.includes(id)) {
            skycon.set("icon", Skycons.SNOW);
        } else {
            skycon.set("icon", Skycons.CLOUDY);
        }
        skycon.play();
    }

    function isLate() {
        let date = new Date();
        let hours = date.getHours();
        console.log(hours);
        if (hours >= 17 && hours <= 6) {
            return true;
        }
        return false;
    }

    /*User inputs functions*/

    function getPosition(position) {
        latitude = "51.509865"; //default for London
        longitude = "-0.118092"; //default for London
        if (navigator.geolocation) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        }
        pubSub.publish("latlon", { latitude, longitude });
        pubSub.publish("markerLatLong", { latitude, longitude });
    }

    function deniedPosition() {
        latitude = "51.509865"; //default for London
        longitude = "-0.118092"; //default for London
        pubSub.publish("latlon", { latitude, longitude });
        return;
    }

    function addQueryToLocalStorage(query) {
        userQueries.push(query);
        localStorage.setItem("userSearches", JSON.stringify(userQueries));
    }

    function getCity() {
        city = this.value;
        pubSub.publish("cityChanged", city);
        addQueryToLocalStorage(city);
        this.value = "";
    }

    /*event lisitner*/
    navigator.geolocation.getCurrentPosition(getPosition, deniedPosition);
    inputBox.addEventListener("change", getCity);
})();
