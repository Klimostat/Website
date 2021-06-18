document.addEventListener("DOMContentLoaded", () => klimostat.init(), false);

/**
 * Main object for the klimostat project, contains many other objects needed
 */
const klimostat = {
    /**
     * Array of all sensors with all parameters as they are in the database.
     * Is initialized with the init() call.
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

    /**
     *
     * @type {Object}
     */
    chartNodes: {},


    /**
     * object of all intervals
     * @type {Object}
     */
    intervals: {},

    /**
     * the loaded view, either dashboard or interval
     * @type {string}
     */
    loadedView: "",

    /**
     * array of functions that is executed when the environment is loaded.
     * useful for accessing variables that are no yet initialized.
     * @type {function[]}
     */
    initFunctions: [],

    /**
     * initializes environment at the start
     */
    init: function () {
        let onSuccess = function(xhr) {
            klimostat.initFunctions.forEach(fn => fn());

            for (let intervalsKey in klimostat.intervals) {
                intervals.push(intervalsKey, klimostat.intervals[intervalsKey].fullName);
            }

            klimostat.chartNodes = {
                temperature: document.getElementById('chart-temperature'),
                humidity: document.getElementById('chart-humidity'),
                co2: document.getElementById('chart-co2'),
            }

            // console.log("init: stations loaded: " + this.responseText);
            let json = JSON.parse(xhr.responseText);
            for (let i = 0; i < json.length; i++) {
                let stationId = parseInt(json[i].pk_station_id);
                klimostat.stations[stationId] = new Station(json[i]);
            }

            setInterval(() => {
                // feeds db
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "PHP/feeddb.php", true);
                xhr.send();
            }, 1000);

            klimostat.determineView();
        }

        fetcher.fetch(undefined, "POST", "PHP/getStations.php", onSuccess, false)

        Notification.requestPermission();

        Chart.defaults.interaction = {mode: 'nearest', axis: 'x'}
        Chart.defaults.plugins.tooltip.itemSort = (x, y) => {return y.raw - x.raw}
        Chart.defaults.plugins.legend.position = 'left';
        Chart.defaults.plugins.title.display = true;

        countdown.init(10, onConnectionLost, onUpdate);
    },

    /**
     * determines the view based on the cookie of selected stations, when it is null then dashboard is loaded, else interval
     */
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

    /**
     * updates the charts based on the loaded view
     */
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
        if (Notification.permission === "granted") {
            new Notification(message);
        }
    }
}

/**
 * api for fetching data from a website, uses xhr
 * @type {Object}
 */
const fetcher = {
    /**
     * array of active xhr request, used for queueing
     * @type {XMLHttpRequest[]}
     */
    active: [],

    /**
     * the que of xhr requests ready for sending
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
                    console.log("db response:")
                    console.log(JSON.parse(this.responseText));
                    callbackFnOn200(this);
                } else {
                    onConnectionLost();
                }
                fetcher.next(this);
            }
        };
        xhr.open(method, url, true);
        xhr.formdata = formdata;


        // no active requests
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

    /**
     * sends the next xhr out of queue
     * @param xhr
     */
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

/**
 * changes styling in case of being offline
 */
let onConnectionLost = function () {
    document.body.classList.toggle("timeout", true);
}

/**
 * changes styling in case of being online again
 */
let onUpdate = function () {
    document.body.classList.toggle("timeout", false);
    document.getElementById("lastUpdated").innerHTML = date.toLocalReadableString(new Date());
}

/**
 * api for the countdown
 */
const countdown = {
    /**
     * function that is called when the countdown finishes
     * @type {?Function}
     */
    _fnOnEnd: null,

    /**
     * the js-interval-object that triggers the functions
     * @type {?number}
     */
    _interval: null,

    /**
     * the amount of seconds left until the countdown finishes
     * @type {number}-
     */
    _secsLeft: 0,

    /**
     * the node where the countdown text is being displayed
     * @type {HTMLElement | null}
     */
    _node: null,

    /**
     * the timeout: starts to count after the countdown finished until the countdown is set again
     * @type {number}
     */
    _timeout: 10,

    /**
     * function that is called when the timeout is over
     * @type {Function}
     */
    _fnOnTimeout: null,

    /**
     * function that is called when the timeout has passed and the countdown is started again
     * @type {Function}
     */
    _fnOnReconnect: null,

    /**
     * initializes the countdown
     * @param timeout {number} the duration until timeout
     * @param callbackFnOnTimeout {Function} the function that is called at timeout
     * @param callbackFnOnReconnect {Function} the funciton that is called when the countdown is started again on timeout
     */
    init: function (timeout, callbackFnOnTimeout, callbackFnOnReconnect) {
        this._timeout = timeout;
        this._fnOnTimeout = callbackFnOnTimeout;
        this._fnOnReconnect = callbackFnOnReconnect;
        this._node = document.getElementById("nextUpdateIn");
        this._node = document.getElementById("nextUpdateIn");
    },

    /**
     * used to start or reset the countdown
     * @param secs {number} the number of seconds when the countdown ends
     * @param callbackFnOnEnd {Function} the function that is called after the countdown ends
     */
    start: function (secs, callbackFnOnEnd) {
        this._fnOnReconnect();
        this._secsLeft = secs;
        this._fnOnEnd = callbackFnOnEnd;
        this._update();
        this.stop();
        this._interval = setInterval(() => countdown._update(), 1000);
    },

    /**
     * stops the countdown and writes loaded
     */
    stop: function () {
        this._fnOnReconnect();
        clearInterval(this._interval);
        this._node.innerHTML = "loaded";
    },

    /**
     * updates the countdown.
     * decreases the seconds left and calls callbacks
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
    }
}

/**
 * helper function for date operations
 */
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

    /**
     * converts a Date object to a custom string depending on the interval given
     * @param dateObj {Date} the date
     * @param interval {string} the interval
     * @return {string}
     */
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
            case "30min":
                return ('00' + dateObj.getHours()).slice(-2) + ':' +
                    Math.floor(dateObj.getMinutes() / 30) * 3 + 'x';
        }
    },
}