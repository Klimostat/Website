document.addEventListener("DOMContentLoaded", () => klimostat.init(), false);

const klimostat = {
    /**
     * Array of all sensors with all parameters as they are in the database.
     * Is initialized with the init() call.
     * ATTENTION!! The index is not equivalent to the sensor id.
     * @type {Station[]}
     */
    stations: [],

    /**
     * Object of all ChartJS charts, initialized with the init() call.
     * @type {Object}
     */
    charts: {
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
    },

    intervals: {},

    /**
     * dashboard, interval
     * @type {string}
     */
    loadedView: "",

    /**
     * @type {{}}
     */
    thresholds: {
        maxCo2: 5000,
        minHumidity: 20
    },

    alertSent: false,

    /**
     * initializes environment at the start
     */
    init: function () {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {

                intervals.push("live");
                intervals.push("hour");

                klimostat.intervals = {
                    live: live,
                    hour: hour,
                }

                // console.log("init: stations loaded: " + this.responseText);
                let json = JSON.parse(this.responseText);
                for (let i = 0; i < json.length; i++) {
                    let stationId = parseInt(json[i].pk_station_id);
                    klimostat.stations[stationId] = new Station(json[i]);
                }
                klimostat.determineView();
            }
        };
        xhttp.open("POST", "PHP/getStations.php", true);
        xhttp.send();

        Notification.requestPermission();

        Chart.defaults.interaction = {
            mode: 'nearest',
            axis: 'x'
        }
        Chart.defaults.plugins.tooltip.itemSort = (x, y) => {return y.raw - x.raw}
        Chart.defaults.plugins.legend.position = 'left';
        Chart.defaults.plugins.title.display = true;

        countdown.init(10, onConnectionLost, onUpdate);
    },

    determineView: function () {
        let viewToLoad = "interval";
        if (selectedStationsCookie.getIds().length === 0) {
            viewToLoad = "dashboard";
        }

        if (viewToLoad !== this.loadedView) {
            switch (this.loadedView) {
                case "dashboard":
                    dashboard.destroy();
                    break;
                case "interval":
                    interval.destroy();
                    break;
            }
            switch (viewToLoad) {
                case "dashboard":
                    dashboard.init();
                    break;
                case "interval":
                    interval.init();
                    break;
            }
            this.loadedView = viewToLoad;
        }
    },

    updateCharts: function () {
        switch (this.loadedView) {
            case "dashboard":
                dashboard.startFetch(0);
                return;
            case "interval":
                interval.startFetch(0);
                return;
            default:
                throw new Error("no view loaded" + this.loadedView);
        }
    },

    /**
     * sends an alert via notifications
     * @param message {String}
     */
    sendAlert: function (message = "Achtung! Ein Grenzwert wurde überschritten!") {
        if (!this.alertSent && Notification.permission === "granted") {
            new Notification(message);
            this.alertSent = true;
            setTimeout(() => klimostat.alertSent = false, 1000);
        }
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
    document.getElementById("lastUpdated").innerHTML = date.toLocalReadableString(new Date());
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
        this.stop();
        this._interval = setInterval(() => countdown._update(), 1000);
    },

    stop: function () {
        this._fnOnReconnect();
        clearInterval(this._interval);
        this._node.innerHTML = "loaded";
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

const date = {

    /**
     * convert a mySQL datetime string to a Date object
     * @param mysqlDatetimeStr the mySQL datetime string
     * @return {Date}
     */
    parseMySQL: function (mysqlDatetimeStr) {
        return new Date(mysqlDatetimeStr.replace(" ", "T") + "Z")
    },

    /**
     * converts a Date object to a mySQL datetime string
     * @param dateObj {Date} the Date
     * @return {string} the mySQL datetime string
     */
    toUTCMySQLDate: function (dateObj) {
        return dateObj.getUTCFullYear() + '-' +
            ('00' + (dateObj.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + dateObj.getUTCDate()).slice(-2) + ' ' +
            ('00' + dateObj.getUTCHours()).slice(-2) + ':' +
            ('00' + dateObj.getUTCMinutes()).slice(-2) + ':' +
            ('00' + dateObj.getUTCSeconds()).slice(-2);
    },

    /**
     * converts a Date object to a local user readable string
     * @param dateObj {Date} the Date
     * @return {string} the string
     */
    toLocalReadableString: function (dateObj) {
        return dateObj.getDate() + '.' +
            ('00' + (dateObj.getMonth() + 1)).slice(-2) + '.' +
            ('00' + dateObj.getFullYear()).slice(-2) + ' ' +
            ('00' + dateObj.getHours()).slice(-2) + ':' +
            ('00' + dateObj.getMinutes()).slice(-2) + ':' +
            ('00' + dateObj.getSeconds()).slice(-2);
    },

    toIntervalLocalReadableString: function (dateObj, interval) {
        switch (interval) {
            case "live":
            case "10sec":
                return ('00' + dateObj.getHours()).slice(-2) + ':' +
                    ('00' + dateObj.getMinutes()).slice(-2) + ':' +
                    Math.floor(dateObj.getSeconds() / 10) + 'x';
            case "min":
                return ('00' + dateObj.getHours()).slice(-2) + ':' +
                    ('00' + dateObj.getMinutes()).slice(-2);
            case "10min":
                return ('00' + dateObj.getHours()).slice(-2) + ':' +
                    Math.floor(dateObj.getMinutes() / 10) + 'x';
        }
    }
}