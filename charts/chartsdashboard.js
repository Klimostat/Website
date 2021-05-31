let dashboard = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,
    DISPLAYED_STATION_COUNT: 5,

    /**
     *
     * @type {SensorChart}
     */
    humidityChart: null,

    /**
     *
     * @type {SensorChart}
     */
    co2Chart: null,

    /**
     *
     * @type {number[]}
     */
    maxCo2Ids: null,

    /**
     *
     * @type {number[]}
     */
    minHumidityIds: null,

    /**
     * initializes live charts and sets interval
     */
    init: function () {
        // console.log("destroyed charts and loaded dashboard");
        charts = {
            humidity: new Chart(document.getElementById('chart-humidity'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'Humidity'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '% rH',
                                align: 'end'
                            }
                        }
                    }
                }
            }),
            co2: new Chart(document.getElementById('chart-co2'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'CO2'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'ppm',
                                align: 'end'
                            }
                        }
                    }
                }
            })
        };

        this.maxCo2Ids = [];
        this.minHumidityIds = [];
        this.humidityChart = new SensorChart([{name: "humidity", chart: charts.humidity}]);
        this.co2Chart = new SensorChart([{name: "co2", chart: charts.co2}]);
        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        charts.humidity.destroy();
        this.humidityChart.clear();
        charts.co2.destroy();
        this.co2Chart.clear();
        this.maxCo2Ids = null;
        this.minHumidityIds = null;
    },

    /**
     *
     */
    startFetch: function (secs) {
        countdown.start(secs, function () {dashboard.fetchDataAndRestartCountdown()});
    },

    /**
     *
     */
    fetchDataAndRestartCountdown: function () {
        let stationsToLoad = [];
        stations.forEach(station => {
            stationsToLoad.push({
                id: station.id,
                since: station.lastFetch
            })
        });

        // console.log(stationsToLoad);

        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));

        /**
         *
         * @param xhr {XMLHttpRequest}
         */
        let update_fn = function (xhr) {
            let dataPerStation = JSON.parse(xhr.responseText);
            // console.log("db response: ");
            // console.log(dataPerStation);
            for (let dataset of dataPerStation) {
                stations[parseInt(dataset.id)].updateValues(dataset.data);
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            }
            dashboard.appendValuesFromStationToCharts();
            dashboard.startFetch(10);
        }

        fetch(data, "POST", "PHP/getDataLive.php", update_fn, true);
    },

    /**
     * appends values to a chart
     */
    appendValuesFromStationToCharts: function () {
        this.updateAndDisplay();

        // console.log("appendValuesFromStationsToCharts: updateCo2Chart()");
        this.co2Chart.updateCharts();
        // console.log("appendValuesFromStationsToCharts: updateHumidityChart()");
        this.humidityChart.updateCharts();
    },

    /**
     *
     */
    updateAndDisplay: function () {
        /**
         *
         * @type {number[]}
         */
        let maxCo2IdsNew = this.maxCo2Ids.slice();
        /**
         *
         * @type {number[]}
         */
        let maxCo2IdsOld = this.maxCo2Ids.slice();
        /**
         *
         * @type {number[]}
         */
        let minHumidityIdsNew = this.minHumidityIds.slice();
        /**
         *
         * @type {number[]}
         */
        let minHumidityIdsOld = this.minHumidityIds.slice();

        stations.forEach(station => {
            //CO2
            let co2CompareFn = (a, b) => -stations[a].maxCo2 + stations[b].maxCo2;
            if (maxCo2IdsNew.includes(station.id)) {
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (maxCo2IdsNew.length < this.DISPLAYED_STATION_COUNT) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (station.maxCo2 > stations[maxCo2IdsNew[maxCo2IdsNew.length - 1]].maxCo2) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
                maxCo2IdsNew.pop();
            }

            //Humidity
            let humidityCompareFn = (a, b) => stations[a].minHumidity - stations[b].minHumidity;
            if (minHumidityIdsNew.includes(station.id)) {
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (minHumidityIdsNew.length < this.DISPLAYED_STATION_COUNT) {
                minHumidityIdsNew.push(station.id);
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (station.minHumidity < stations[minHumidityIdsNew[minHumidityIdsNew.length - 1]].minHumidity) {
                minHumidityIdsNew.push(station.id);
                minHumidityIdsNew.sort(humidityCompareFn);
                minHumidityIdsNew.pop();
            }
        });

        for (let i = 0; i < maxCo2IdsOld.length; i++){
            const id = maxCo2IdsOld[i];
            if (!maxCo2IdsNew.includes(id)) {
                maxCo2IdsOld.splice(i, 1);
                this.co2Chart.remove(id);
                i--;
            }
        }

        for (let i = 0; i < minHumidityIdsOld.length; i++){
            const id = minHumidityIdsOld[i];
            if (!minHumidityIdsNew.includes(id)) {
                minHumidityIdsOld.splice(i, 1);
                // console.log("dashboard.updateAndDisplay: remove station from humidity chart " + id)
                this.humidityChart.remove(id);
                i--;
            }
        }

        for (let i = 0; i < maxCo2IdsNew.length; i++){
            const id = maxCo2IdsNew[i];
            if (!maxCo2IdsOld.includes(id)) {
                maxCo2IdsOld.push(id);
                this.co2Chart.push(id, {co2: {dataset: stations[id].datasetChart.maxCo2, name: stations[id].name + " max"}});
            }
        }

        for (let i = 0; i < minHumidityIdsNew.length; i++){
            const id = minHumidityIdsNew[i];
            if (!minHumidityIdsOld.includes(id)) {
                minHumidityIdsOld.push(id);
                // console.log("dashboard.updateAndDisplay: push station to humidity chart " + id)
                this.humidityChart.push(id, {humidity: {dataset: stations[id].datasetChart.minHumidity, name: stations[id].name + " min"}});
            }
        }

        this.maxCo2Ids = maxCo2IdsNew;
        this.minHumidityIds = minHumidityIdsNew;
    },
}