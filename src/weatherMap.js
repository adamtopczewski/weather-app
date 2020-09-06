import pubSub from "./pubSub.js";

const weatherModule = (function() {
    let apiKey = "apiKey";
    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&`;
    let weather;
    let latitude;
    let longitude;
    let cityName;
    let userInputedCity = false;
    let errorBox = document.querySelector("#error");; // = dom element
    
    /*subscribe*/

    pubSub.subscribe("latlon", ({ longitude: lon, latitude: lat }) => {
        latitude = lat;
        longitude = lon;
        fetchWeatherByLatLong();
    });

    pubSub.subscribe("cityChanged", userCityInput => {
        cityName = userCityInput;
        fetchWeatherByCity();
    });

    const fetchWeatherByLatLong = async () => {
        try {
            const userQuery = `${url}lat=${latitude}&lon=${longitude}`;
            let weatherJson = await fetch(userQuery);
            weather = await weatherJson.json();
            pubSub.publish("weather", weather);
        } catch (error) {
            alert("Couldn't get longitude and latitude"); //not many cases
        }
    }
    const fetchWeatherByCity = async () => {
        try {
            const userQuery = `${url}&q=${cityName}`;
            let weatherJson = await fetch(userQuery);
            weather = await weatherJson.json();
            userInputedCity = true;
            latitude = weather.coord.lat;
            longitude = weather.coord.lon;
            pubSub.publish("weather", weather);
            pubSub.publish("cityQueryDone", userInputedCity);
            pubSub.publish("markerLatLong", { latitude, longitude });
            userInputedCity = !userInputedCity
        } catch (error) {
            showError()
        }
    }

    function showError(){
        errorBox.style.display = 'block';
        setTimeout(() =>{
            errorBox.style.display = 'none'
        }, 2000)
    }
})();
