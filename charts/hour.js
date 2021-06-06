const hour = {
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
        let callback = function (data) {
            hour.updateChartValues(data);
            // for (let dataOfStation of data) {
            //     klimostat.stations[parseInt(dataOfStation.id)].updateValues(dataOfStation.data, "hour");
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            // }
        }

        return {data: data, method: "POST", url: "PHP/getDataTimewise.php", callback: callback, refresh: false};
    },

    updateChartValues: function (data) {
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            let dataPrepared = {};

            for (const entry of dataOfStation.data) {
                let entryTime = date.parseMySQL(entry.time);
                let entryTimeString = date.toIntervalLocalReadableString(entryTime, "min");
                dataPrepared[entryTimeString] = {
                    minCo2: entry.minCo2,
                    maxCo2: entry.maxCo2,
                    minHumidity: entry.minHumidity,
                    maxHumidity: entry.maxHumidity,
                    minTemperature: entry.minTemperature,
                    maxTemperature: entry.maxTemperature
                }
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
            time.setHours(actTime.getHours() - 1);

            let push = function (where, what) {
                where.push(what);
            }

            station.datasets.minTemperature.splice(0, station.datasets.minTemperature.length);
            station.datasets.maxTemperature.splice(0, station.datasets.maxTemperature.length);
            station.datasets.minCo2.splice(0, station.datasets.minCo2.length);
            station.datasets.maxCo2.splice(0, station.datasets.maxCo2.length);
            station.datasets.minHumidity.splice(0, station.datasets.minHumidity.length);
            station.datasets.maxHumidity.splice(0, station.datasets.maxHumidity.length);

            for (; time < actTime; time.setMinutes(time.getMinutes() + 1)) {
                let timeString = date.toIntervalLocalReadableString(time, "min");
                // console.log("read entry " + timeString);
                // console.log(dataPrepared);

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
        time.setHours(actDate.getHours() - 1);

        sensorChart.labels.splice(0, sensorChart.labels.length);

        for (; time < actDate; time.setMinutes(time.getMinutes() + 1)) {
            let timeString = date.toIntervalLocalReadableString(time, "min");
            sensorChart.labels.push(timeString);
        }

        sensorChart.lastLabelUpdate = actDate;
        sensorChart.loadedInterval = "hour";
    }
};