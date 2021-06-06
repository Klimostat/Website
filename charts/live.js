/**
 *
 * @type {Object}
 */
const live = {
    /**
     *
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch: function () {
        // prepares data to fetch
        /**
         * @type {{id: number, since: Date}[]}
         */
        let stationsToLoad = [];
        selectedStations.forEach((station) => {
            if (station.loadedInterval !== "live") {
                station.liveData.timestampOfNewestData = null;
                station.liveData.timestampOfNewestDatasetEntry = null;
            }
            stationsToLoad.push({
                id: station.id,
                since: station.liveData.timestampOfNewestData
            });
            station.loadedInterval = "live";
        });
        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));

        // function to work with return values
        let callback = function (data) {
            live.updateChartValues(data);
            // for (let dataset of dataPerStation) {

                // klimostat.stations[parseInt(dataset.id)].updateValues(dataset.data, "live");
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            // }
        }

        return {data: data, method: "POST", url: "PHP/getDataLive.php", callback: callback, refresh: true};
    },

    /**
     *
     * @param data {Object}
     */
    updateChartValues: function (data) {
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            let dataPrepared = {};

            for (const entry of dataOfStation.data) {

                if (entry.co2 >= klimostat.thresholds.maxCo2) {
                    klimostat.sendAlert(this.alertMessageCO2);
                }
                if (entry.humidity < klimostat.thresholds.minHumidity) {
                    klimostat.sendAlert(this.alertMessageHumidity);
                }
                let entryTime = date.parseMySQL(entry.time);
                let entryTimeString = date.toIntervalLocalReadableString(entryTime, "live");

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.liveData.station.navNode.updateNewestData();
                }

                if (dataPrepared[entryTimeString] === undefined) {
                    dataPrepared[entryTimeString] = {
                        minCo2: entry.co2,
                        maxCo2: entry.co2,
                        minHumidity: entry.humidity,
                        maxHumidity: entry.humidity,
                        minTemperature: entry.temperature,
                        maxTemperature: entry.temperature
                    }
                } else {
                    dataPrepared[entryTimeString] = {
                        minCo2: Math.min(entry.co2, dataPrepared[entryTimeString].minCo2),
                        maxCo2: Math.max(entry.co2, dataPrepared[entryTimeString].maxCo2),
                        minHumidity: Math.min(entry.humidity, dataPrepared[entryTimeString].minHumidity),
                        maxHumidity: Math.max(entry.humidity, dataPrepared[entryTimeString].maxHumidity),
                        minTemperature: Math.min(entry.temperature, dataPrepared[entryTimeString].minTemperature),
                        maxTemperature: Math.max(entry.temperature, dataPrepared[entryTimeString].maxTemperature)
                    }
                }
                station.liveData.minHumidity = Math.min(entry.humidity, station.liveData.minHumidity);
                station.liveData.maxCo2 = Math.max(entry.co2, station.liveData.maxCo2);
            }

            /**
             *
             * @type {Date}
             */
            const actTime = new Date();
            actTime.setMilliseconds(0);

            /**
             *
             * @type {Date}
             */
            let time = new Date();
            time.setMinutes(actTime.getMinutes() - 5);

            let push = function (where, what) {
                where.push(what);
                where.shift();
            }

            if (station.liveData.timestampOfNewestDatasetEntry === null) {
                station.datasets.minTemperature.splice(0, station.datasets.minTemperature.length);
                station.datasets.maxTemperature.splice(0, station.datasets.maxTemperature.length);
                station.datasets.minCo2.splice(0, station.datasets.minCo2.length);
                station.datasets.maxCo2.splice(0, station.datasets.maxCo2.length);
                station.datasets.minHumidity.splice(0, station.datasets.minHumidity.length);
                station.datasets.maxHumidity.splice(0, station.datasets.maxHumidity.length);

                push = function (where, what) {
                    where.push(what);
                }
            } else {
                time = station.liveData.timestampOfNewestDatasetEntry;
            }

            // console.log("stations - lastChartUpdate: " + this.lastChartUpdate);
            // console.log(this.dataPrepared);

            for (; time < actTime; time.setSeconds(time.getSeconds() + 10)) {
                let timeString = date.toIntervalLocalReadableString(time, "live");

                let values = dataPrepared[timeString];
                if (typeof values !== "object") {
                    values = {
                        minCo2: NaN,
                        maxCo2: NaN,
                        minHumidity: NaN,
                        maxHumidity: NaN,
                        minTemperature: NaN,
                        maxTemperature: NaN
                    }
                }
                push(station.datasets.minTemperature, values.minTemperature);
                push(station.datasets.maxTemperature, values.maxTemperature);
                push(station.datasets.minCo2, values.minCo2);
                push(station.datasets.maxCo2, values.maxCo2);
                push(station.datasets.minHumidity, values.minHumidity);
                push(station.datasets.maxHumidity, values.maxHumidity);
            }

            station.liveData.timestampOfNewestDatasetEntry = actTime;
        }
    },

    /**
     *
     * @param sensorChart {SensorChart}
     * @param append {boolean}
     */
    updateChartLabels: function (sensorChart, append = false) {
        let actDate = new Date();
        actDate.setMilliseconds(0);

        let time = new Date();
        time.setMinutes(actDate.getMinutes() - 5);

        let push = function (where, what) {
            where.push(what);
            where.shift();
        }

        if (append && sensorChart.lastLabelUpdate !== null && sensorChart.loadedInterval === "live") {
            time = sensorChart.lastLabelUpdate;
        } else {
            sensorChart.labels.splice(0, sensorChart.labels.length);
            push = function (where, what) {
                where.push(what);
            }
        }

        for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
            let timeString = date.toIntervalLocalReadableString(time, "10sec");
            push(sensorChart.labels, timeString);
        }

        sensorChart.lastLabelUpdate = actDate;
        sensorChart.loadedInterval = "live";
    }
};