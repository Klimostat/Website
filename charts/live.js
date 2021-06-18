/**
 * selectable interval that represents 5min live data
 * @type {Object}
 */
klimostat.intervals.live = {
    /**
     * the key name of the interval
     * @type {string}
     */
    name: "live",

    /**
     * the name to be displayed as option in the select
     * @type {string}
     */
    fullName: "Live",

    /**
     * the period in milliseconds of a timestamp
     */
    intervalPeriod: 10_000,

    /**
     * prepares a JSON to be sent to the server to fetch only the data needed
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch: function () {
        // prepares data to fetch
        /**
         * @type {{id: number, since: Date}[]}
         */
        let stationsToLoad = [];
        selectedStations.forEach((station) => {
            if (station.loadedInterval !== this.name) {
                station.liveData.timestampOfNewestData = null;
                station.liveData.timestampOfNewestDatasetEntry = null;
            }
            stationsToLoad.push({
                id: station.id,
                since: station.liveData.timestampOfNewestData
            });
        });
        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));

        // function to work with return values
        let callback = function (data, sensorChart) {
            klimostat.intervals.live.updateChartValues(data, sensorChart);
        }

        return {data: data, method: "POST", url: "PHP/getDataLive.php", callback: callback, refresh: true};
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
        actTime.setSeconds(Math.floor(actTime.getSeconds() / 10) * 10);

        let time = new Date(actTime);
        time.setMinutes(actTime.getMinutes() - 5);

        let shiftLeft = false;

        if (sensorChart.lastLabelUpdate !== null && sensorChart.loadedInterval === "live") {
            time = sensorChart.lastLabelUpdate;
            shiftLeft = true;
        } else {
            sensorChart.clearChartContents();
        }

        let labels = [];
        while (time < actTime) {
            time.setSeconds(time.getSeconds() + 10)
            labels.push(date.toIntervalLocalReadableString(time, "10sec"));
        }
        sensorChart.pushTimestampRight(labels, shiftLeft);

        sensorChart.lastLabelUpdate = time;
        sensorChart.loadedInterval = "live";

        // append data
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            this.updateStation(station, actTime);

            for (const entry of dataOfStation.data) {
                let entryTime = date.parseMySQL(entry.time);
                entry.temperature = parseFloat(entry.temperature);
                entry.humidity = parseFloat(entry.humidity);
                entry.co2 = parseFloat(entry.co2);
                entryTime.setSeconds(Math.floor(entryTime.getSeconds() / 10) * 10);
                // let entryTimeString = date.toIntervalLocalReadableString(entryTime, "live");
                let index = sensorChart.labels.length - Math.floor((sensorChart.lastLabelUpdate.getTime() - entryTime.getTime()) / this.intervalPeriod) - 1;
                // console.log(date.toIntervalLocalReadableString(entryTime, "live") + " index " + index + ", " + station.datasets.minHumidity.length);

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.navNode.updateNewestData();
                }

                if (typeof station.datasets.minHumidity[index] === "number") {
                    // console.log("outer " + station.id)
                    if (isNaN(station.datasets.minHumidity[index])) {
                        // console.log("first " + station.id)
                        station.datasets.minCo2[index] = entry.co2;
                        station.datasets.maxCo2[index] = entry.co2;
                        station.datasets.minHumidity[index] = entry.humidity;
                        station.datasets.maxHumidity[index] = entry.humidity;
                        station.datasets.minTemperature[index] = entry.temperature;
                        station.datasets.maxTemperature[index] = entry.temperature;
                    } else {
                        // console.log(entry)
                        // console.log(station.datasets.minHumidity[index]);
                        // console.log("second " + station.id)
                        station.datasets.minCo2[index] = Math.min(station.datasets.minCo2[index], entry.co2);
                        station.datasets.maxCo2[index] = Math.max(station.datasets.maxCo2[index], entry.co2);
                        station.datasets.minHumidity[index] = Math.min(station.datasets.minHumidity[index], entry.humidity);
                        station.datasets.maxHumidity[index] = Math.max(station.datasets.maxHumidity[index], entry.humidity);
                        station.datasets.minTemperature[index] = Math.min(station.datasets.minTemperature[index], entry.temperature);
                        station.datasets.maxTemperature[index] = Math.max(station.datasets.maxTemperature[index], entry.temperature);
                    }
                }

                station.minHumidity.update(entryTime, entry.humidity);
                station.maxCo2.update(entryTime, entry.co2);
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
        time.setMinutes(actTime.getMinutes() - 5);

        let shiftLeft = false;

        if (station.liveData.timestampOfNewestDatasetEntry !== null && station.loadedInterval === "live") {
            time = station.liveData.timestampOfNewestDatasetEntry;
            shiftLeft = true;
        } else {
            station.clearDatasets();
        }

        station.pushDatasets(Math.floor((actTime.getTime() - time.getTime()) / this.intervalPeriod), shiftLeft);

        station.liveData.timestampOfNewestDatasetEntry = new Date(actTime);
        station.loadedInterval = "live";
    }
};