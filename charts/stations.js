document.addEventListener("DOMContentLoaded", init, false);

/**
 * Array of all sensors with all parameters as they are in the database.
 * Is initialized with the init() call.
 * ATTENTION!! The index is not equivalent to the sensor id.
 * @type {Station[]}
 */
let stations = [];

/**
 * Object of all ChartJS charts, initialized with the init() call.
 * @type {Object}
 */
let charts = {
    temperature: null,
    humidity: null,
    co2: null
};

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
 * initializes environment at the start
 */
function init() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log("init: stations loaded: " + this.responseText);
            let json = JSON.parse(this.responseText);
            for (let i = 0; i < json.length; i++) {
                let stationId = parseInt(json[i].pk_station_id);
                stations[stationId] = new Station(json[i], selectedStations.getIds().includes(stationId));
            }
            determineView();
        }
    };
    xhttp.open("POST", "PHP/getStations.php", true);
    xhttp.send();

    Notification.requestPermission();
}

function determineView() {
    // console.log("selectedStations");
    // console.log(selectedStations.get());
    if (selectedStations.get().length === 0) {
        if (loadedCharts !== "dashboard") {
            loadedCharts = "dashboard";
            dashboard.init();
        }
    } else {
        if (loadedCharts !== "live") {
            loadedCharts = "live";
            liveCharts.init();
        }
    }
}

function updateCharts() {
    switch (loadedCharts) {
        case "live":
            liveCharts.updateCharts();
            return;
        case "dashboard":
            dashboard.updateCharts();
            return;
        default:
            console.log("no charts loaded");
    }
}

const selectedStations = {
    _ids: null,

    get: function () {
        let lstations = [];
        this.getIds().forEach(id => {
            lstations.push(stations[id])
        });
        return lstations;
    },

    getIds: function () {
        if (this._ids === null) {
            this._ids = [];

            let cookie = document.cookie.split('; ')
                .find(cookie => cookie.startsWith("station_ids="));
            if (cookie !== undefined) {
                cookie.split("=")[1].split(",").forEach(id => {
                    this._ids.push(parseInt(id));
                });
            }
        }
        return this._ids;
    },

    /**
     *
     * @param id {number}
     */
    toggle: function (id) {
        this.getIds();

        // checks on wrong loaded charts
        if (this._ids.length === 0 && loadedCharts !== "live") {
            this._ids.push(id);
            this.updateCookie();
            determineView();
            return;
        }

        if (this._ids.includes(id)) {
            //remove
            // console.log("remove " + id);
            this.remove(id, true)
        } else {
            // add
            // console.log("adds " + id);
            this.push(id, true);
        }

        this.updateCookie();

        updateCharts();
    },

    /**
     *
     */
    updateCookie: function () {
        if (this._ids.length === 0) {
            document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "station_ids=" + this._ids + "; SameSite=Strict; Secure";
        }
    },

    clear: function () {
        // loads updates from cookie
        this.getIds();

        // clears list
        this._ids = []

        // disables all styling
        this.display();

        // writes cookie
        this.updateCookie();

        determineView();
    },

    /**
     *
     * @param id {number}
     * @param secure {boolean}
     */
    remove: function (id, secure = true) {
        if (secure) {
            // loads updates from cookie
            this.getIds();
        }

        // checks for already displayed
        if (!this._ids.includes(id)) {
            return;
        }

        // takes out of list
        this._ids.splice(this._ids.indexOf(id), 1);

        // disables styling and removes from displayed stations
        this.display(id);

        if (secure) {
            // writes cookie
            this.updateCookie();
        }
    },

    /**
     *
     * @param id {number}
     * @param secure {boolean}
     */
    push: function (id, secure=true) {
        if (secure) {
            // loads updates from cookie
            this.getIds();
        }

        // checks for already displayed
        if (this._ids.includes(id)) {
            return;
        }

        // checks on wrong loaded charts
        // if (loadedCharts !== "live") {
        //     this._ids.push(id);
        //     this.updateCookie();
        //     determineView();
        //     return;
        // }

        // adds to list
        this._ids.push(id);

        // enables styling and adds to displayed stations
        this.display(id);

        if (secure) {
            // updates cookies
            this.updateCookie();
        }
    },

    display: function (id=null) {
        let displayFunction = station => {
            let toDisplay = this._ids.includes(station.id);
            // console.log("display - id: " + station.id + ", toDisplay: " + toDisplay);

            // toggles styling
            station.getNavNode().parentElement.classList.toggle("active", toDisplay);

            if (toDisplay) {
                // adds to graph
                // console.log("pushed toDisplay");
                displayedStations.push(station.id);
            } else {
                //removes from graph
                displayedStations.remove(station.id);
            }
        };

        if (typeof id === "number") {
            displayFunction(stations[id]);
        } else {
            stations.forEach(displayFunction);
        }
    },

    forEach: function (fn) {
        this._ids.forEach(id => {
            fn(stations[id]);
        });
    }
}

const displayedStations = {
    /**
     *
     */
    _ids: [],

    /**
     *
     * @param id {number}
     */
    remove: function (id) {
        if (this._ids.includes(id)) {
            let index = this._ids.indexOf(id);

            charts.temperature.data.datasets.splice(index, 1);
            charts.humidity.data.datasets.splice(index, 1);
            charts.co2.data.datasets.splice(index, 1);

            this._ids.splice(index, 1);
        }
    },

    /**
     *
     * @param id {number}
     */
    push: function (id) {

        // console.log("displayed Stations:");
        // console.log(this._stations);
        if (!this._ids.includes(id)) {
            let station = stations[id];
            let color = station.color;

            // console.log("pushed station to charts");
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

            this._ids.push(id);
        }
    },

    /**
     *
     * @param fn {function}
     */
    forEach: function (fn) {
        this._ids.forEach(id => fn(stations[id]));
    },

    /**
     *
     */
    clear: function () {
        this._ids = [];
        charts.temperature.data.datasets = [];
        charts.humidity.data.datasets = [];
        charts.co2.data.datasets = [];
    },

    /**
     *
     * @param id {number}
     * @return {boolean}
     */
    includes: function (id) {
        return this._ids.includes(id);
    },

    /**
     * @return {number}
     */
    size: function () {
        return this._ids.length;
    },

    /**
     *
     * @param index {number}
     * @return {Station}
     */
    get: function (index) {
        return stations[this._ids[index]];
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