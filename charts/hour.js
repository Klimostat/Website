/**
 *
 * @type {Object}
 */
klimostat.intervals.hour = {
    name: "hour",

    fullName: "Last hour",

    intervalPeriod: 60_000,
    /**
     *
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch: function () {
        // prepares data to fetch
        /**
         * @type {{id: number}[]}
         */
        let stationsToLoad = [];
        selectedStations.forEach((station) => {
            if (station.loadedInterval !== "hour") {
                stationsToLoad.push({
                    id: station.id,
                });
            }
            station.loadedInterval = "hour";
        });
        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));
        data.append('interval', "hour");

        // function to work with return values
        let callback = function (data, sensorChart) {
            klimostat.intervals.hour.updateChartValues(data, sensorChart);
        }

        return {data: data, method: "POST", url: "PHP/getDataTimewise.php", callback: callback, refresh: false};
    },

    /**
     *
     * @param data {Object}
     * @param sensorChart {SensorChart}
     */
    updateChartValues: function (data, sensorChart) {

        //update labels
        let actTime = new Date();
        actTime.setMilliseconds(0);
        actTime.setSeconds(0);
        actTime.setSeconds(Math.floor(actTime.getSeconds() / 10) * 10);

        let time = new Date(actTime);
        time.setMinutes(actTime.getMinutes() - 60);

        let shiftLeft = false;

        if (sensorChart.lastLabelUpdate !== null && sensorChart.loadedInterval === this.name) {
            time = sensorChart.lastLabelUpdate;
            shiftLeft = true;
        } else {
            sensorChart.clearChartContents();
        }

        let labels = [];
        while (time < actTime) {
            time.setMinutes(time.getMinutes() + 1)
            labels.push(date.toIntervalLocalReadableString(time, "min"));
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

                station.liveData.minHumidity = Math.min(entry.minHumidity, station.liveData.minHumidity);
                station.liveData.maxCo2 = Math.max(entry.maxCo2, station.liveData.maxCo2);
            }

            if (station.liveData.maxCo2 >= station.thresholdCo2) {
                klimostat.sendAlert(station.alertMessageCO2);
            }
            if (station.liveData.minHumidity < station.thresholdHumidity) {
                klimostat.sendAlert(station.alertMessageHumidity);
            }
        }
    },

    /**
     *
     * @param station {Station}
     * @param actTime {Date}
     */
    updateStation: function(station, actTime) {
        let time = new Date(actTime);
        time.setMinutes(actTime.getMinutes() - 60);

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