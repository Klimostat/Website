/**
 * selectable interval that represents a day (24hr) history
 * @type {Object}
 */
klimostat.intervals.day = {
    /**
     * the key name of the interval
     * @type {string}
     */
    name: "day",

    /**
     * the name to be displayed as option in the select
     * @type {string}
     */
    fullName: "Last 24 hours",

    /**
     * the period in milliseconds of a timestamp
     */
    intervalPeriod: 30 * 60_000,

    /**
     * prepares a JSON to be sent to the server to fetch only the data needed
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch: function () {
        // prepares data to fetch
        /**
         * @type {{id: number}[]}
         */
        let stationsToLoad = [];
        selectedStations.forEach((station) => {
            if (station.loadedInterval !== this.name) {
                stationsToLoad.push({
                    id: station.id,
                });
            }
            // station.loadedInterval = this.name;
        });
        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));
        data.append('interval', this.name);

        let thisInterval = this;
        // function to work with return values
        let callback = function (data, sensorChart) {
            thisInterval.updateChartValues(data, sensorChart);
        }

        return {data: data, method: "POST", url: "PHP/getDataTimewise.php", callback: callback, refresh: false};
    },

    /**
     * updates the charts, its labels and the values in it by updating the datasets in {@link Station}
     * @param data {{id: number, data: {time: string, minCo2: string, maxCo2: string, minHumidity: string, maxHumidity: string, minTemperature: string, maxTemperature: string}[]}[]} the data to be appended
     * @param sensorChart {SensorChart}
     */
    updateChartValues: function (data, sensorChart) {

        //update labels
        let actTime = new Date();
        actTime.setMilliseconds(0);
        actTime.setSeconds(0);
        actTime.setMinutes(Math.floor(actTime.getMinutes() / 30) * 30);

        let time = new Date(actTime);
        time.setHours(actTime.getHours() - 24);

        let shiftLeft = false;

        if (sensorChart.lastLabelUpdate !== null && sensorChart.loadedInterval === this.name) {
            time = sensorChart.lastLabelUpdate;
            shiftLeft = true;
        } else {
            sensorChart.clearChartContents();
        }

        let labels = [];
        while (time < actTime) {
            time.setMinutes(time.getMinutes() + 30)
            labels.push(date.toIntervalLocalReadableString(time, "30min"));
        }
        sensorChart.pushTimestampRight(labels, shiftLeft);

        sensorChart.lastLabelUpdate = time;
        sensorChart.loadedInterval = this.name;

        // append data
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            this.updateStation(station, actTime);

            for (const entry of dataOfStation.data) {
                let entryTime = date.parseMySQL(entry.time);
                entry.minCo2 = parseFloat(entry.minCo2);
                entry.maxCo2 = parseFloat(entry.maxCo2);
                entry.minHumidity = parseFloat(entry.minHumidity);
                entry.maxHumidity = parseFloat(entry.maxHumidity);
                entry.minTemperature = parseFloat(entry.minTemperature);
                entry.maxTemperature = parseFloat(entry.maxTemperature);
                entryTime.setSeconds(0);
                // let entryTimeString = date.toIntervalLocalReadableString(entryTime, "live");
                let index = sensorChart.labels.length - Math.floor((sensorChart.lastLabelUpdate.getTime() - entryTime.getTime()) / this.intervalPeriod) - 1;
                // console.log(date.toIntervalLocalReadableString(entryTime, "live") + " index " + index + ", " + station.datasets.minHumidity.length);

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.liveData.station.navNode.updateNewestData();
                }

                if (typeof station.datasets.minHumidity[index] === "number") {
                    // console.log("outer " + station.id)
                    if (isNaN(station.datasets.minHumidity[index])) {
                        // console.log("first " + station.id)
                        station.datasets.minCo2[index] = entry.minCo2;
                        station.datasets.maxCo2[index] = entry.maxCo2;
                        station.datasets.minHumidity[index] = entry.minHumidity;
                        station.datasets.maxHumidity[index] = entry.maxHumidity;
                        station.datasets.minTemperature[index] = entry.minTemperature;
                        station.datasets.maxTemperature[index] = entry.maxTemperature;
                    } else {
                        // console.log(entry)
                        // console.log(station.datasets.minHumidity[index]);
                        // console.log("second " + station.id)
                        station.datasets.minCo2[index] = Math.min(station.datasets.minCo2[index], entry.minCo2);
                        station.datasets.maxCo2[index] = Math.max(station.datasets.maxCo2[index], entry.maxCo2);
                        station.datasets.minHumidity[index] = Math.min(station.datasets.minHumidity[index], entry.minHumidity);
                        station.datasets.maxHumidity[index] = Math.max(station.datasets.maxHumidity[index], entry.maxHumidity);
                        station.datasets.minTemperature[index] = Math.min(station.datasets.minTemperature[index], entry.minTemperature);
                        station.datasets.maxTemperature[index] = Math.max(station.datasets.maxTemperature[index], entry.maxTemperature);
                    }
                }
            }
        }
    },

    /**
     * Synchronizes the datasets of the stations with the labels in the charts
     * @param station {Station} the station that should be synchronized
     * @param actTime {Date} the time of the last entry
     */
    updateStation: function(station, actTime) {
        let time = new Date(actTime);
        time.setHours(actTime.getHours() - 24);

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
    }};