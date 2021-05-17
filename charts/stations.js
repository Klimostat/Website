document.addEventListener("DOMContentLoaded", init, false);

/**
 * Array of all sensors with all parameters as they are in the database.
 * Is initialized with the init() call.
 * ATTENTION!! The index is not equivalent to the sensor id.
 * @type {Station[]}
 */
let stations = [];

let displayedStations = [];

let colors = [
    "#ff0000",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#0000ff",
    "#ff00ff"
]

/**
 * Object of all ChartJS charts, initialized with the init() call.
 * @type {Object}
 */
let charts = {};

/**
 * live, dashboard, history
 * @type {string}
 */
let loadedCharts = "";

let grenzwertCO2;
let grenzwertHumidity;

/**
 * Controls the data-updates
 * @type {number}
 */
let nextUpdateIn = 0;
let intervalObj = null;

/**
 * Controls the data-updates
 * @type {Date}
 */
let lastUpdate = null;

/**
 * initializes environment at the start
 */
function init() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log("init: stations loaded: " + this.responseText);
            let selectedStationIds = getSelectedStationIds();
            let json = JSON.parse(this.responseText);
            for (let i = 0; i < json.length; i++) {
                let stationId = json[i].pk_station_id
                stations[stationId] = new Station(json[i], selectedStationIds.includes(json[i].pk_station_id));
            }
            determineView();
        }
    };
    xhttp.open("POST", "PHP/getStations.php", true);
    xhttp.send();

    Notification.requestPermission();

}

function determineView() {
    let selectedStations = getSelectedStations();
    // if (selectedStation === null) {
        // dashboardCharts.updateCharts();
    // } else {
        liveCharts.init();
    // }
}

/**
 *
 * @return {Station|null}
 */
function getSelectedStation() {
    let cookie = document.cookie.split('; ')
        .find(cookie => cookie.startsWith("station_id="));
    if (typeof cookie === "string" || typeof cookie === "number") {
        // console.log("getSelectedStation: " + cookie);
        return stations[parseInt(cookie.split("=")[1])];
    } else {
        // console.log("getSelectedStation: null");
        return null;
    }
}

function setSelectedStation(id) {
    if (id === null) {
        document.cookie = "station_id=null; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    } else {
        document.cookie = "station_id=" + id + "; SameSite=None; Secure";
    }
    determineView();
}

function getSelectedStationIds() {
    let cookie = document.cookie.split('; ')
        .find(cookie => cookie.startsWith("station_ids="));
    if (cookie !== null && (typeof cookie === "string" || typeof cookie === "number")) {
        return cookie.split("=")[1].split(",");
    } else {
        return [];
    }
}

function getSelectedStations() {
    let selectedStationIds = getSelectedStationIds();
    let selectedStations = [];
    for (let id of selectedStationIds) {
        selectedStations.push(stations[id])
    }
    // console.log("getSelectedStations: " + selectedStations);
    return selectedStations;
}

// let checkStationSelection = function() {
//     let selectedStations = [];
//     for (let station of stations) {
//
//         check for empty slots
        // if (typeof station !== "object") {
        //     continue;
        // }
        //
        // if (station.getNavNode().checked) {
        //     selectedStations.push(station.id);
        // }
    // }
    // console.log(selectedStations + " are checked");
    // if (selectedStations.length === 0) {
    //     document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    // } else {
    //     document.cookie = "station_ids=" + selectedStations + "; SameSite=Strict; Secure";
    // }
// }

/**
 *
 * @param stationId {number}
 */
function toggleDisplayedStation(stationId, initial=false) {
    let station = stations[stationId];

    if (displayedStations.includes(station)) {
        
        //remove
        station.getNavNode().parentElement.classList.toggle("active", false);

        let index = displayedStations.indexOf(station);

        displayedStations.splice(index, 1);
        charts.temperature.data.datasets.splice(index, 1);
        charts.humidity.data.datasets.splice(index, 1);
        charts.co2.data.datasets.splice(index, 1);

    } else {
        // add
        station.getNavNode().parentElement.classList.toggle("active", true);
        let color = colors[(station.id * 2 + 1) % 5];

        displayedStations.push(station);

        charts.temperature.data.datasets.push({
            label: station.name,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            segment: {
                // borderDash: ctx => skipped(ctx, ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined),
            }
        });

        charts.humidity.data.datasets.push({
            label: station.name,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            segment: {
                // borderDash: ctx => skipped(ctx, ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined),
            }
        });

        charts.co2.data.datasets.push({
            label: station.name,
            data: [],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            segment: {
                // borderDash: ctx => skipped(ctx, ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined),
            }
        });
    }

    let selectedStations = [];
    for (let station of displayedStations) {
        selectedStations.push(station.id);
    }
    if (selectedStations.length === 0) {
        document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    } else {
        document.cookie = "station_ids=" + selectedStations + "; SameSite=Strict; Secure";
    }

    if (!initial) {
        liveCharts.updateCharts();
    }
}

/**
 * convert a mySQL datetime string to a Date object
 * @param mysqlDatetimeStr the mySQL datetime string
 * @return {Date}
 */
function mySQLToUTCJSDate(mysqlDatetimeStr) {
    return new Date(mysqlDatetimeStr.replace(" ", "T") + "Z")
}

/**
 * converts a Date object to a mySQL datetime string
 * @param dateObj {Date} the Date
 * @return {string} the mySQL datetime string
 */
function jsToUTCMySQLDate(dateObj) {
    return dateObj.getUTCFullYear() + '-' +
        ('00' + (dateObj.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + dateObj.getUTCDate()).slice(-2) + ' ' +
        ('00' + dateObj.getUTCHours()).slice(-2) + ':' +
        ('00' + dateObj.getUTCMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getUTCSeconds()).slice(-2);
}

/**
 * converts a Date object to a local user readable string
 * @param dateObj {Date} the Date
 * @return {string} the string
 */
function jsToLocalReadableString(dateObj) {
    return dateObj.getDate() + '.' +
        ('00' + (dateObj.getMonth()+1)).slice(-2) + '.' +
        ('00' + dateObj.getFullYear()).slice(-2) + ' ' +
        ('00' + dateObj.getHours()).slice(-2) + ':' +
        ('00' + dateObj.getMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getSeconds()).slice(-2);
}


function jsTimeTo10MinLocalReadableString(dateObj) {
    return dateObj.getHours() + ':' +
        dateObj.getMinutes() + ':' +
        Math.floor(dateObj.getSeconds() / 10) + 'x';
}


/**
 * sends an alert via notifications and displays a red bar
 */
let sendAlert = function () {
    if (Notification.permission === "granted") {
        new Notification("Achtung! Ein Grenzwert wurde überschritten!");
    }
    // document.getElementById("alert").style.display = "block";
}