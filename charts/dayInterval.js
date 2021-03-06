class DayInterval extends Interval {
    constructor() {
        super({
            name: "day",
            fullName: "Last 24 hours",
            intervalPeriod: 30 * 60_000,
            overallPeriod: 24 * 60 * 60_000,
            getActTime: () => {
                let actTime = new Date();
                actTime.setMilliseconds(0);
                actTime.setSeconds(0);
                actTime.setMinutes(Math.ceil(actTime.getMinutes() / 30) * 30);
                return actTime;
            },
            modifyEntryTime: time => {
                time.setMilliseconds(0);
                time.setSeconds(0);
                time.setMinutes(Math.floor(time.getMinutes() / 30) * 30);
                return time;
            },
            formatTime: time => {
                return ('00' + time.getHours()).slice(-2) + ':' +
                    Math.floor(time.getMinutes() / 30) * 30;
            }
        });
    }

    /**
     * prepares a JSON to be sent to the server to fetch only the data needed
     * @return {{data: FormData, method: string, callback: callback, refresh: boolean, url: string}}
     */
    fetch() {
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
    }

    /**
     * updates the charts, its labels and the values in it by updating the datasets in {@link Station}
     * @param data {{id: number, data: {time: string, minCo2: string, maxCo2: string, minHumidity: string, maxHumidity: string, minTemperature: string, maxTemperature: string}[]}[]} the data to be appended
     * @param sensorChart {SensorChart}
     */
    updateChartValues(data, sensorChart) {
        let actTime = this.getActTime();
        this.updateLabels(sensorChart, actTime);

        // append data
        for (let dataOfStation of data) {
            let station = klimostat.stations[dataOfStation.id];
            this.updateStation(station, actTime);

            for (const entry of dataOfStation.data) {
                this.pushSummarizedDataToStation(station, entry, actTime);
            }
        }
    }
}