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
    /**
     * @type {Chart}
     */
    temperature: null,

    /**
     * @type {Chart}
     */
    humidity: null,

    /**
     * @type {Chart}
     */
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
                stations[stationId] = new Station(json[i]);
            }
            determineView();
        }
    };
    xhttp.open("POST", "PHP/getStations.php", true);
    xhttp.send();

    Notification.requestPermission();

    countdown.init(10, onConnectionLost, onUpdate);
}

function determineView() {
    // console.log("selectedStations");
    // console.log(selectedStations.get());
    let chartsToLoad = "live";
    if (selectedStationsCookie.getIds().length === 0) {
        chartsToLoad = "dashboard";
    }

    if (chartsToLoad !== loadedCharts) {
        switch (loadedCharts) {
            case "dashboard":
                dashboard.destroy();
                break;
            case "live":
                live.destroy();
                break;
        }
        loadedCharts = chartsToLoad;
        switch (loadedCharts) {
            case "dashboard":
                dashboard.init();
                break;
            case "live":
                live.init();
                break;
        }
    }
}

function updateCharts() {
    switch (loadedCharts) {
        case "live":
            live.startFetch(0);
            return;
        case "dashboard":
            dashboard.startFetch(0);
            return;
        default:
            throw new Error("no charts loaded");
    }
}

const fetcher = {
    /**
     * @type {XMLHttpRequest[]}
     */
    active: [],

    /**
     * @type {XMLHttpRequest[]}
     */
    que: [],

    /**
     * sends a HTTP request to fetch data
     * @param formdata {FormData} the data to be sent with the HTTP request
     * @param method {string} the method for the request to be used
     * @param url {string} the url of the request
     * @param callbackFnOn200 {function(xhr: XMLHttpRequest)} a callback function that is called on HTTP 200 response
     * @param queue {boolean} whether the last request should be cancelled or the new request should be queued
     // * @return {XMLHttpRequest} the XMLHttpRequest object
     */
    fetch: function (formdata, method, url, callbackFnOn200, queue=false) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    callbackFnOn200(this);
                } else {
                    onConnectionLost();
                }
                fetcher.next(this);
            }
        };
        xhr.open(method, url, true);
        xhr.formdata = formdata;


        //no active
        if (this.active.length === 0) {
            xhr.send(formdata);
            this.active.push(xhr);

        // cancel others
        } else if (!queue) {
            this.que = [];
            this.active.forEach(xhr => xhr.onreadystatechange = new function () {});

            xhr.send(formdata);
            this.active.push(xhr);

        // add to queue
        } else {
            this.que.push(xhr);
        }
    },

    next: function (xhr) {
        let index = this.active.indexOf(xhr);
        this.active.splice(index, 1);

        if (this.que.length > 0) {
            let newXhr = this.que.shift();
            newXhr.send(newXhr.formdata);
            this.active.push(newXhr);
        }
    }
}

let onConnectionLost = function () {
    document.body.classList.toggle("timeout", true);
}

let onUpdate = function () {
    document.body.classList.toggle("timeout", false);
    document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(new Date());
}

let countdown = {
    /**
     *
     * @type {?Function}
     * @private
     */
    _fnOnEnd: null,

    /**
     *
     * @type {?number}
     * @private
     */
    _interval: null,

    /**
     *
     * @type {number}
     */
    _secsLeft: 0,

    /**
     * @type {HTMLElement | null}
     */
    _node: null,

    _timeout: 10,

    _fnOnTimeout: null,

    _fnOnReconnect: null,

    /**
     *
     * @param timeout {number}
     * @param callbackFnOnTimeout {Function}
     * @param callbackFnOnReconnect {Function}
     */
    init: function (timeout, callbackFnOnTimeout, callbackFnOnReconnect) {
        this._timeout = timeout;
        this._fnOnTimeout = callbackFnOnTimeout;
        this._fnOnReconnect = callbackFnOnReconnect;
        this._node = document.getElementById("nextUpdateIn");
        this._node = document.getElementById("nextUpdateIn");
    },

    /**
     *
     * @param secs {number}
     * @param callbackFnOnEnd {Function}
     */
    start: function (secs, callbackFnOnEnd) {
        this._fnOnReconnect();
        this._secsLeft = secs;
        this._fnOnEnd = callbackFnOnEnd;
        this._update();
        clearInterval(this._interval);
        this._interval = setInterval(() => countdown._update(), 1000);
    },

    /**
     *
     * @private
     */
    _update: function () {
        if (this._secsLeft === 0) {
            this._fnOnEnd();
            this._node.innerHTML = "new request sent";
        } else if (this._timeout + this._secsLeft <= 0) {
            this._fnOnTimeout();
            this._fnOnEnd();
            this._node.innerHTML = "retrying";
            this._secsLeft = 0;
        } else if (this._secsLeft < 0) {
            this._node.innerHTML = "waiting for response: " + (this._timeout + this._secsLeft);
        } else if (this._secsLeft > 0) {
            this._node.innerHTML = "next update in " + (this._secsLeft) + " seconds";
        }
        this._secsLeft--;

        // feeds db
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "PHP/feeddb.php", true);
        xhttp.send();
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
