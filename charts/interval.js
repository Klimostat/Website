/**
 *
 */
class Interval {

    /**
     * the key name of the interval
     * @type {string}
     */
    name;

    /**
     * the name to be displayed as option in the select
     * @type {string}
     */
    fullName;

    /**
     * the period in milliseconds of a timestamp
     * @type {number}
     */
    intervalPeriod;

    /**
     * the period in milliseconds of the whole chart, used to determine the first entry and the count of entries
     * @type {number}
     */
    overallPeriod;

    /**
     * adjusts a Date and removes milliseconds etc.
     * @return {Date}
     */
    getActTime;

    /**
     * modifies the time of an entry for correct placing in the charts
     * @param time {Date}
     * @return {Date}
     */
    modifyEntryTime;

    /**
     * formats a time to be displayed in the label
     * @param time {Date}
     * @return {string}
     */
    formatTime;

    /**
     *
     * @param name {string}
     * @param fullName {string}
     * @param intervalPeriod {number}
     * @param overallPeriod {number}
     * @param getActTime {function: Date}
     * @param modifyEntryTime {function(Date): Date}
     * @param formatTime {function(Date): string}
     */
    constructor({name: name, fullName: fullName, intervalPeriod: intervalPeriod, overallPeriod: overallPeriod, getActTime: getActTime, modifyEntryTime: modifyEntryTime, formatTime: formatTime}) {
        this.name = name;
        this.fullName = fullName;
        this.intervalPeriod = intervalPeriod;
        this.overallPeriod = overallPeriod;
        this.getActTime = getActTime;
        this.modifyEntryTime = modifyEntryTime;
        this.formatTime = formatTime;
        console.log({name: name, fullName: fullName, intervalPeriod: intervalPeriod, overallPeriod: overallPeriod, getActTime: getActTime, modifyEntryTime: modifyEntryTime, formatTime: formatTime})
    }

    /**
     * Synchronizes the datasets of the stations with the labels in the charts
     * @param station {Station} the station that should be synchronized
     * @param actTime {Date} the time of the last entry
     */
    updateStation(station, actTime) {
        let time = new Date(actTime);
        time.setTime(time.getTime() - this.overallPeriod);

        let shiftLeft = false;

        if (station.liveData.timestampOfNewestDatasetEntry !== null && station.loadedInterval === this.name) {
            time = station.liveData.timestampOfNewestDatasetEntry;
            shiftLeft = true;
        } else {
            station.clearDatasets();
        }

        station.pushDatasets(Math.floor((actTime.getTime() - time.getTime()) / this.intervalPeriod), shiftLeft);

        station.liveData.timestampOfNewestDatasetEntry = new Date(actTime);
        station.loadedInterval = this.name;
    }

    /**
     * updates the labels of the sensor chart
     * @param sensorChart {SensorChart} the sensorChart to update
     * @param actTime {Date} the time of the last entry
     */
    updateLabels(sensorChart, actTime) {
        let time = new Date(actTime);
        time.setTime(time.getTime() - this.overallPeriod);

        let shiftLeft = false;

        if (sensorChart.lastLabelUpdate !== null && sensorChart.loadedInterval === this.name) {
            time = sensorChart.lastLabelUpdate;
            shiftLeft = true;
        } else {
            sensorChart.clearChartContents();
        }

        let labels = [];
        while (time < actTime) {
            labels.push(this.formatTime(time));
            time.setTime(time.getTime() + this.intervalPeriod);
        }
        sensorChart.pushTimestampRight(labels, shiftLeft);

        sensorChart.lastLabelUpdate = time;
        sensorChart.loadedInterval = this.name;
    }

    /**
     *
     */
    pushDataToStation(station, {minCo2, maxCo2, minHumidity, maxHumidity, minTemperature, maxTemperature}, actTime, entryTime) {
        let index = station.datasets.dummy.length - Math.floor((actTime.getTime() - entryTime.getTime()) / this.intervalPeriod);
        console.log("insert at index " + index + "[+1]/" + station.datasets.dummy.length + ", actTime: " + actTime + ", entryTime:" + entryTime);

        if (typeof station.datasets.dummy[index] === "number") {
            if (isNaN(station.datasets.dummy[index])) {
                station.datasets.dummy[index] = 0;
                station.datasets.minCo2[index] = minCo2;
                station.datasets.maxCo2[index] = maxCo2;
                station.datasets.minHumidity[index] = minHumidity;
                station.datasets.maxHumidity[index] = maxHumidity;
                station.datasets.minTemperature[index] = minTemperature;
                station.datasets.maxTemperature[index] = maxTemperature;
            } else {
                station.datasets.minCo2[index] = Math.min(station.datasets.minCo2[index], minCo2);
                station.datasets.maxCo2[index] = Math.max(station.datasets.maxCo2[index], maxCo2);
                station.datasets.minHumidity[index] = Math.min(station.datasets.minHumidity[index], minHumidity);
                station.datasets.maxHumidity[index] = Math.max(station.datasets.maxHumidity[index], maxHumidity);
                station.datasets.minTemperature[index] = Math.min(station.datasets.minTemperature[index], minTemperature);
                station.datasets.maxTemperature[index] = Math.max(station.datasets.maxTemperature[index], maxTemperature);
            }
        }
    }
}


/**
 * api for the select-HTML-node that gives the user the ability to choose the interval to display
 * @type {Object}
 */
const intervals = {
    /**
     * The select-HTML-node where the user can select the interval
     * @type {?HTMLElement}
     */
    _node: null,

    _intervals: [],

    _selectedIntervalIndex: 0,

    /**
     * Adds an interval to the select-HTML-node
     * @param interval {Interval} the interval
     */
    push: function (interval) {
        this._intervals.push(interval);
        let node = this.getNode();
        let option = document.createElement("option");
        option.innerHTML = interval.fullName;
        option.value = interval.name;
        node.appendChild(option);
    },

    /**
     * returns the HTMLElement of the select-HTML-node
     * @return {HTMLElement}
     */
    getNode: function () {
        if (this._node === null || this._node.constructor !== HTMLElement) {
            this._node = document.getElementById("interval");
        }
        return this._node;
    },

    /**
     * returns the interval of the selected option
     * @return {Interval}
     */
    getSelected: function () {
        return this._intervals.find(interval => interval.name === this.getNode().value);
    },

    /**
     * returns the interval with the given name
     * @param name {string}
     * @return {Interval}
     */
    get: function (name) {
        return this._intervals.find(interval => interval.name === name);
    },

    /**
     * sets the selected interval in the node to the name
     * @param interval {?string} the name of the interval that should be selected, if null the cookie-value
     * @param updateCharts {boolean} whether or not the charts should be updated
     */
    setSelected: function (interval = null, updateCharts = true) {
        if (interval !== null) {
            this._node.value = interval;
        }
        selectedIntervalCookie.update(this._node.value);
        if (updateCharts) {
            klimostat.updateCharts();
        }
    }
}

/**
 * api for the cookie for {@link intervals}
 * @type {Object}
 */
const selectedIntervalCookie = {
    /**
     * the key of the selected interval
     */
    _interval: null,

    /**
     * returns the interval saved in the cookie
     * @return {?string} the key of the interval or null if not set
     */
    getInterval: function () {
        if (this._interval === null) {
            let cookie = document.cookie.split('; ')
                .find(cookie => cookie.startsWith("interval="));
            if (cookie !== undefined) {
                this._interval = cookie.split("=")[1];
            }
        }
        return this._interval;
    },

    /**
     * sets the interval to be saved in the cookie and updates the cookie
     * @param interval {String} the key of the interval to be saved in the cookie
     */
    update: function (interval) {
        this._interval = interval;
        if (this._interval === null) {
            document.cookie = "interval=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "interval=" + this._interval + "; SameSite=Strict; Secure";
        }
    }
}