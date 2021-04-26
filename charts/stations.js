/**
 * Array of all sensors with all parameters as they are in the database.
 * Is initialized with the init() call.
 * ATTENTION!! The index is not equivalent to the sensor id.
 * @type {Object[]}
 */
let stations = [];

// let selectedStationIndex = 3;

/**
 * Object of all ChartJS charts, initialized with the init() call.
 * @type {Object}
 */
let charts = {};


/**
 * initializes environment at the start
 */
function init() {
    // intervalSelect = document.getElementById("interval");

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let json = JSON.parse(this.responseText);
            for (let i = 0; i < json.length; i++) {
                stations[json[i].pk_station_id] = json[i];
            }
            console.log(stations);
            initCharts();
        }
    };
    xhttp.open("POST", "PHP/getStations.php", true);
    xhttp.send();
}

function getSelectedStation() {
    let cookie = document.cookie.split('; ')
        .find(cookie => cookie.startsWith("station_id="));
    if (typeof cookie === "string" || typeof cookie === "number") {
        console.log(cookie);
        return cookie.split("=")[1];
    } else {
        return 1;
    }
}

function setSelectedStation(id) {
    document.cookie = "station_id=" + id + "; SameSite=None; Secure";
    updateCharts(null, true)
}