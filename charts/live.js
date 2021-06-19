class LiveInterval extends Interval {

    constructor() {
        super({
            name: "live",
            fullName: "Live",
            intervalPeriod: 10_000,
            overallPeriod: 5 * 60_000,
            getActTime: () => {
                let actTime = new Date();
                actTime.setMilliseconds(0);
                actTime.setSeconds(Math.ceil(actTime.getSeconds() / 10) * 10);
                return actTime;
            },
            modifyEntryTime: time => {
                time.setMilliseconds(0);
                time.setSeconds(Math.floor(time.getSeconds() / 10) * 10);
                return time;
            },
            formatTime: time => {
                return ('00' + time.getHours()).slice(-2) + ':' +
                    ('00' + time.getMinutes()).slice(-2) + ':' +
                    Math.floor(time.getSeconds() / 10) + 'x';
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

        let live = this;
        // function to work with return values
        let callback = function (data, sensorChart) {
            live.updateChartValues(data, sensorChart);
        }

        return {data: data, method: "POST", url: "PHP/getDataLive.php", callback: callback, refresh: true};
    }

    /**
     * updates the charts, its labels and the values in it by updating the datasets in {@link Station}
     * @param data {{id: number, data: {time: string, co2: string, humidity: string, temperature: string}[]}[]} the data to be appended
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
                let entryTime = this.modifyEntryTime(date.parseMySQL(entry.time));
                let temperature = parseFloat(entry.temperature);
                let humidity = parseFloat(entry.humidity);
                let co2 = parseFloat(entry.co2);

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.navNode.updateNewestData();
                }

                this.pushDataToStation(station, {
                    minCo2: co2,
                    maxCo2: co2,
                    minHumidity: humidity,
                    maxHumidity: humidity,
                    minTemperature: temperature,
                    maxTemperature: temperature
                }, actTime, entryTime);

                station.minHumidity.update(entryTime, humidity);
                station.maxCo2.update(entryTime, co2);
            }
        }
    }
}