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
        klimostat.charts = {
            humidity: new Chart(klimostat.chartNodes.humidity, {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        title: {
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
            co2: new Chart(klimostat.chartNodes.co2, {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        title: {
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
        klimostat.chartNodes.humidity.parentElement.style.display = "block";
        klimostat.chartNodes.co2.parentElement.style.display = "block";

        this.maxCo2Ids = [];
        this.minHumidityIds = [];
        this.humidityChart = new SensorChart([{name: "humidity", chart: klimostat.charts.humidity}]);
        this.co2Chart = new SensorChart([{name: "co2", chart: klimostat.charts.co2}]);
        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        klimostat.charts.humidity.destroy();
        this.humidityChart.clear();
        klimostat.charts.co2.destroy();
        this.co2Chart.clear();
        for (let chartNodesKey in klimostat.chartNodes) {
            klimostat.chartNodes[chartNodesKey].parentElement.style.display = "none";
        }
        this.maxCo2Ids = null;
        this.minHumidityIds = null;
    },

    /**
     *
     * @param secs {number}
     */
    startFetch: function (secs) {
        countdown.start(secs, function () {dashboard.fetchDataAndRestartCountdown()});
    },

    /**
     *
     */
    fetchDataAndRestartCountdown: function () {
        let stationsToLoad = [];
        let time = new Date();
        klimostat.stations.forEach(station => {
            stationsToLoad.push({
                id: station.id,
                since: station.liveData.timestampOfLastFetch
            });
            station.liveData.timestampOfLastFetch = time;
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
            klimostat.intervals.live.updateChartValues(dataPerStation, dashboard.co2Chart, true);
            klimostat.intervals.live.updateChartValues(dataPerStation, dashboard.humidityChart, true);
            dashboard.updateAndDisplay();
            dashboard.startFetch(10);
        }

        fetcher.fetch(data, "POST", "PHP/getDataLive.php", update_fn, true);
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

        klimostat.stations.forEach(station => {
            //CO2
            let co2CompareFn = (a, b) => -klimostat.stations[a].liveData.maxCo2.get() + klimostat.stations[b].liveData.maxCo2.get();
            if (maxCo2IdsNew.includes(station.id)) {
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (maxCo2IdsNew.length < this.DISPLAYED_STATION_COUNT) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
            } else if (station.liveData.maxCo2.get() > klimostat.stations[maxCo2IdsNew[maxCo2IdsNew.length - 1]].liveData.maxCo2.get()) {
                maxCo2IdsNew.push(station.id);
                maxCo2IdsNew.sort(co2CompareFn);
                maxCo2IdsNew.pop();
            }

            //Humidity
            let humidityCompareFn = (a, b) => klimostat.stations[a].liveData.minHumidity.get() - klimostat.stations[b].liveData.minHumidity.get();
            if (minHumidityIdsNew.includes(station.id)) {
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (minHumidityIdsNew.length < this.DISPLAYED_STATION_COUNT) {
                minHumidityIdsNew.push(station.id);
                minHumidityIdsNew.sort(humidityCompareFn);
            } else if (station.liveData.minHumidity.get() < klimostat.stations[minHumidityIdsNew[minHumidityIdsNew.length - 1]].liveData.minHumidity.get()) {
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
                this.co2Chart.push(id, {co2: {dataset: klimostat.stations[id].datasets.maxCo2, name: klimostat.stations[id].name + " max"}});
            }
        }

        for (let i = 0; i < minHumidityIdsNew.length; i++) {
            const id = minHumidityIdsNew[i];
            if (!minHumidityIdsOld.includes(id)) {
                minHumidityIdsOld.push(id);
                // console.log("dashboard.updateAndDisplay: push station to humidity chart " + id)
                this.humidityChart.push(id, {humidity: {dataset: klimostat.stations[id].datasets.minHumidity, name: klimostat.stations[id].name + " min"}});
            }
        }

        this.maxCo2Ids = maxCo2IdsNew;
        this.minHumidityIds = minHumidityIdsNew;

        this.co2Chart.updateCharts();
        this.humidityChart.updateCharts();
    },
}