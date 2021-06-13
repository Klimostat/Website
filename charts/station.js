let colors = [
    "#ff0000",
    "#ffb000",
    "#ffff00",
    "#b0ff00",
    "#00ff00",
    "#00ffb0",
    "#00ffff",
    "#00b0ff",
    "#0000ff",
    "#b000ff",
    "#ff00ff",
    "#ff00b0"
]

class Station {
    /**
     *
     * @type {Object}
     */
    navNode = {
        /**
         * @type {Station}
         */
        station: this,

        _nodes: {
            nav: null,
            lastUpdate: null,
            alert: null
        },

        /**
         *
         */
        styles: {
            selected: false,
            offline: false,
            alerting: false
        },

        /**
         *
         * @param style {string}
         */
        setStyle: function (style) {
            // console.log(style);

            // selected
            this._nodes.nav.classList.toggle("selected", style === "selected");

            //offline
            this._nodes.nav.classList.toggle("offline", style === "offline");
        },

        /**
         *
         */
        updateNewestData: function () {
            this._nodes.lastUpdate.innerHTML = date.toLocalReadableString(this.station.liveData.timestampOfNewestData);
        },

        setAlerting: function (alerting=true, message) {
            this.styles.alerting = alerting;
            this._nodes.nav.classList.toggle("alerting", alerting);
            this._nodes.alert.innerHTML = message;
        }
    };

    /**
     *
     * @type {{maxTemperature: [], minTemperature: [], maxHumidity: [], maxCo2: [], minCo2: [], minHumidity: []}}
     */
    datasets = {
        dummy: [],
        minTemperature: [],
        maxTemperature: [],
        minCo2: [],
        maxCo2: [],
        minHumidity: [],
        maxHumidity: []
    };

    // lastDataPrepared = null;

    loadedInterval = "";
    color;
    id;
    name;
    location;

    /**
     * @type {ExtremeValues}
     */
    minHumidity;

    /**
     * @type {ExtremeValues}
     */
    maxCo2;

    /**
     *
     * @type {Object}
     */
    liveData = {
        station: this,

        /**
         * @type {Date}
         */
        timestampOfNewestData: null,

        /**
         * @type {Date}
         */
        timestampOfNewestDatasetEntry: null,
    }

    /**
     *
     * @param dbFetch {Object}
     */
    constructor(dbFetch) {
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.location = dbFetch.location;
        this.color = colors[klimostat.stations.length % 12];
        this.maxCo2 = new ExtremeValues(this, parseFloat(dbFetch.threshold_co2), dbFetch.alert_message_co2, false, 0)
        this.minHumidity = new ExtremeValues(this, parseFloat(dbFetch.threshold_humidity), dbFetch.alert_message_humidity, true, 100)

        // creates navNode
        let stationsBox = document.getElementById("stations-box");

        let tooltipBase = document.createElement("div");
        tooltipBase.classList.add("tooltip-base");

        let navNode = this.navNode._nodes.nav = document.createElement("a");
        navNode.classList.add("list-group-item", "station-node");
        navNode.href = "javascript:selectedStations.toggle(" + this.id + ")";
        navNode.innerHTML = this.name;

        // card
        let card = document.createElement("div");
        card.classList.add("card");

        let cardBody = document.createElement("div");
        cardBody.classList.add("list-group");

        let location = document.createElement("li");
        location.classList.add("list-group-item");
        location.innerHTML = "Location: " + this.location;

        let lastUpdate = this.navNode._nodes.lastUpdate = document.createElement("li");
        lastUpdate.classList.add("list-group-item");
        lastUpdate.innerHTML = "Last update: ";

        let lastUpdateSpan = document.createElement("span");
        lastUpdateSpan.innerHTML = "not yet";
        lastUpdate.appendChild(lastUpdateSpan);

        let alert = this.navNode._nodes.alert = document.createElement("li");
        alert.classList.add("list-group-item");
        alert.innerHTML = "everything ok";

        cardBody.appendChild(location);
        cardBody.appendChild(lastUpdate);
        cardBody.appendChild(alert);

        // appends
        stationsBox.appendChild(tooltipBase);
        tooltipBase.appendChild(navNode);
        tooltipBase.appendChild(card);
        card.appendChild(cardBody);
    }

    /**
     *
     * @return {boolean}
     */
    isOffline() {
        if (this.liveData.timestampOfNewestData !== null) {
            let lastFetch = new Date(this.liveData.timestampOfNewestData);
            return lastFetch.setMinutes(lastFetch.getMinutes() + 5) < new Date();
        }
        return true;
    }

    /**
     *
     */
    clearDatasets() {
        // console.log("cleared data: " + this.id);
        let length = this.datasets.dummy.length;
        this.datasets.dummy.splice(0, length);
        this.datasets.minTemperature.splice(0, length);
        this.datasets.maxTemperature.splice(0, length);
        this.datasets.minCo2.splice(0, length);
        this.datasets.maxCo2.splice(0, length);
        this.datasets.minHumidity.splice(0, length);
        this.datasets.maxHumidity.splice(0, length);
    }

    /**
     *
     * @param count {number}
     * @param shiftLeft {boolean}
     */
    pushDatasets(count, shiftLeft=true) {
        // console.log("count to push: " + count);
        for (let i = 0; i < count; i++) {
            this.datasets.dummy.push(NaN);
            this.datasets.minTemperature.push(NaN);
            this.datasets.maxTemperature.push(NaN);
            this.datasets.minCo2.push(NaN);
            this.datasets.maxCo2.push(NaN);
            this.datasets.minHumidity.push(NaN);
            this.datasets.maxHumidity.push(NaN);
            if (shiftLeft) {
                this.datasets.dummy.shift();
                this.datasets.minTemperature.shift();
                this.datasets.maxTemperature.shift();
                this.datasets.minCo2.shift();
                this.datasets.maxCo2.shift();
                this.datasets.minHumidity.shift();
                this.datasets.maxHumidity.shift();
            }
        }
    }
}

class ExtremeValues {
    alertSent = false;

    station;

    alertMessage;

    threshold;

    defaultValue;

    minNotMax;

    /**
     * @type {{time: Date, value: number}[]}
     */
    _values = [];

    /**
     *
     * @param station {Station}
     * @param threshold {number}
     * @param alertMessage {string}
     * @param minNotMax {boolean}
     * @param defaultValue {number}
     */
    constructor(station, threshold, alertMessage, minNotMax, defaultValue) {
        this.station = station;
        this.threshold = threshold;
        this.alertMessage = alertMessage;
        this.defaultValue = defaultValue;
        this.minNotMax = minNotMax;
    }

    update(time, value) {
        let lastEntryDate = new Date(time);
        lastEntryDate.setMinutes(lastEntryDate.getMinutes() - 5);
        while (this._values.length > 0 && lastEntryDate > this._values[0].time) {
            this._values.shift();
        }
        while (this._values.length > 0 && (this.minNotMax ? value <= this._values[this._values.length - 1].value : value >= this._values[this._values.length - 1].value)) {
            this._values.pop();
        }
        this._values.push({time: time, value:value});

        if (this.minNotMax ? value < this.threshold : value > this.threshold) {
            this._sendAlert();
        }
    }

    get() {
        return this._values.length === 0 ? this.defaultValue : this._values[0].value;
    }

    _sendAlert() {
        if (!this.alertSent) {
            klimostat.sendAlert(this.station.name + ": " + this.alertMessage);
            this.station.navNode.setAlerting(true, this.alertMessage);
            this.alertSent = true;
        }
    }
}