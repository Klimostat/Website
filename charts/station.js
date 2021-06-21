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

/**
 * represents a station, also controls the navNode at the left
 */
class Station {
    /**
     * object for the navNode
     * @type {NavNode}
     */
    navNode;

    /**
     * the datasets of the station
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

    /**
     * the interval that is in the datasets
     * @type {string}
     */
    loadedInterval;

    /**
     * the color of the station
     * @type {string}
     */
    color;

    /**
     * the id of the station
     * @type {number}
     */
    id;

    /**
     * the name of the station that should be displayed in the navNode
     * @type {string}
     */
    name;

    /**
     * the location of the station
     * @type {string}
     */
    location;

    /**
     * the lowest humidity values of the station
     * @type {ExtremeValues}
     */
    minHumidity;

    /**
     * the highest co2 values of the station
     * @type {ExtremeValues}
     */
    maxCo2;

    /**
     * object used for liveData
     * @type {Object}
     */
    liveData = {
        /**
         * the timestamp of the newest measure loaded locally
         * @type {Date}
         */
        timestampOfNewestData: null,

        /**
         * the timestamp of the last visible entry, can be empty
         * @type {Date}
         */
        timestampOfNewestDatasetEntry: null,
    }

    /**
     *
     * @param dbFetch {{pk_station_id: number|string, name: string, alert_message_humidity: string, alert_message_co2: string, location: string, threshold_co2: number|string, threshold_humidity: number|string}} parameters of the station fetched from the database
     */
    constructor(dbFetch) {
        this.loadedInterval = "";
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.location = dbFetch.location;
        this.color = colors[klimostat.stations.length % 12];
        this.maxCo2 = new ExtremeValues(this, parseFloat(dbFetch.threshold_co2), dbFetch.alert_message_co2, false, 0);
        this.minHumidity = new ExtremeValues(this, parseFloat(dbFetch.threshold_humidity), dbFetch.alert_message_humidity, true, 100);
        this.navNode = new NavNode(this);
    }

    /**
     * returns whether the station is offline (the timestamp of the newest data is older than 5min)
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
     * empties all datasets
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
     * pushes empty slots to the end of the dataset in order to make place for newer data, if shiftLeft is true then the first elements are shifted
     * @param count {number} the number of elements to push
     * @param shiftLeft {boolean} whether the oldest labels from left should be shifted
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

/**
 * handles extreme (max/min) values of a station and sends an alert when a threshold is reached
 */
class ExtremeValues {
    /**
     * whether the alert is already sent or not
     * @type {boolean}
     */
    alertSent = false;

    /**
     * the station the extreme values belong to
     * @type {Station}
     */
    station;

    /**
     * the message that should be sent
     * @type {string}
     */
    alertMessage;

    /**
     * the threshold
     * @type {number}
     */
    threshold;

    /**
     * the default value if no data is given
     * @type {number}
     */
    defaultValue;

    /**
     * whether it reports min or max values
     * @type {boolean}
     */
    minNotMax;

    /**
     * the extreme values with timestamps, only peaks are saved so that this list is as short as possible
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

    /**
     * updates the extreme values by adding the value at the timestamp
     * @param time {Date} the timestamp
     * @param value {number} the value
     */
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

    /**
     * returns the most extreme value
     * @return {number}
     */
    get() {
        return this._values.length === 0 ? this.defaultValue : this._values[0].value;
    }

    /**
     * sends an alert
     * @private
     */
    _sendAlert() {
        if (!this.alertSent) {
            klimostat.sendAlert(this.station.name + ": " + this.alertMessage);
            this.station.navNode.setAlerting(true, this.alertMessage);
            this.alertSent = true;
        }
    }
}