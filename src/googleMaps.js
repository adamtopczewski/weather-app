import pubSub from "./pubSub.js";

const googleMaps = (() => {
    let map;
    let longitude = -0.118092;
    let latitude = 51.509865;
    let mapOptions;
    let marker;
    // let cityNameCache;

    /*subscribe*/
    function attachPubSub() {
        pubSub.subscribe(
            "markerLatLong",
            ({ longitude: lon, latitude: lat }) => {
                latitude = lat;
                longitude = lon;

                if (map) {
                    setNewLatLong();
                }
            }
        );

        pubSub.subscribe("cityQueryDone", userInputedCity => {
            if (userInputedCity && marker) {
                marker.setMap(null);
                marker = null; //reseting marker after user input
            }
        });
    }

    function setNewLatLong() {
        let latLong = new google.maps.LatLng(latitude, longitude);
        map.setCenter(latLong);
        map.panTo(latLong);
    }

    function placeMarker(latLng, map) {
        if (marker) {
            marker.setPosition(latLng);
        } else {
            marker = new google.maps.Marker({
                position: latLng,
                map: map
            });
        }
        map.panTo(latLng);
        latitude = latLng.lat();
        longitude = latLng.lng();
        pubSub.publish("latlon", { latitude, longitude });
    }

    function init() {
        return new Promise((resolve, reject) => {
            const mapScript = document.createElement("script");
            mapScript.type = "text/javascript";
            mapScript.src =
                "apiKey";
            mapScript.async = "async";
            mapScript.onload = () => resolve("script loaded");
            mapScript.onerror = () => reject(err);
            document.querySelector("head").appendChild(mapScript);
        }).then(() => {
            mapOptions = {
                center: { lat: latitude, lng: longitude },
                zoom: 8
            };

            map = new google.maps.Map(
                document.getElementById("map"),
                mapOptions
            );

            map.addListener("click", function(e) {
                placeMarker(e.latLng, map);
                console.log(e);
            });
        });
    }

    attachPubSub();
    init();
})();

export default googleMaps;
