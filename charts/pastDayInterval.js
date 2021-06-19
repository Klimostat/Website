/**
 * creates selectable intervals that represent a day from 0 to 24h
 * @type {Object}
 */
class PastDayInterval extends Interval {
    /**
     * the amount of days in the past
     */
    daysAgo;

    /**
     * creates a new day interval
     * @param name the key name of the interval
     * @param fullName the name to be displayed as option in the select
     * @param daysAgo the count of days in the past
     */
    constructor(name, fullName, daysAgo) {
        if (typeof fullName !== "string") {
            let date = new Date();
            date.setDate(date.getDate() - daysAgo);
            fullName = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        }
        super({
            name: name,
            fullName: fullName,
            intervalPeriod: 30 * 60_000,
            overallPeriod: 24 * 60 * 60_000,
            getActTime: () => {
                let actTime = new Date();
                actTime.setMilliseconds(0);
                actTime.setSeconds(0);
                actTime.setMinutes(0);
                actTime.setHours(0);
                actTime.setDate(actTime.getDate() - this.daysAgo + 1);
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
                    Math.floor(time.getMinutes() / 30) * 3 + '0';
            }
        });
        this.daysAgo = daysAgo;
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
                let entryTime = this.modifyEntryTime(date.parseMySQL(entry.time));
                let minCo2 = parseFloat(entry.minCo2);
                let maxCo2 = parseFloat(entry.maxCo2);
                let minHumidity = parseFloat(entry.minHumidity);
                let maxHumidity = parseFloat(entry.maxHumidity);
                let minTemperature = parseFloat(entry.minTemperature);
                let maxTemperature = parseFloat(entry.maxTemperature);

                // sets last the time when the station last sent data, to show offline stations
                if (station.liveData.timestampOfNewestData === null || entryTime > station.liveData.timestampOfNewestData) {
                    station.liveData.timestampOfNewestData = entryTime;
                    station.navNode.updateNewestData();
                }

                this.pushDataToStation(station, {
                    minCo2: minCo2,
                    maxCo2: maxCo2,
                    minHumidity: minHumidity,
                    maxHumidity: maxHumidity,
                    minTemperature: minTemperature,
                    maxTemperature: maxTemperature
                }, actTime, entryTime);
            }
        }
    }
}