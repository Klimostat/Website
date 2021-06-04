const live = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,

    /**
     * @type {SensorChart}
     */
    sensorCharts: null,

    /**
     * initializes live charts and sets interval
     */
    init: function () {
        // console.log("init called")
        // const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

        charts = {
            temperature: new Chart(document.getElementById('chart-temperature'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'Temperature'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '°C',
                                align: 'end'
                            }
                        }
                    }
                }
            }),
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
        this.sensorCharts = new SensorChart([
            {name: "temperature", chart: charts.temperature},
            {name: "humidity", chart: charts.humidity},
            {name: "co2", chart:charts.co2}
        ]);
        selectedStationsCookie.getIds().forEach(id => {
            selectedStations.push(id);
        });
        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        charts.temperature.destroy();
        charts.humidity.destroy();
        charts.co2.destroy();
        this.sensorCharts.clear();
    },

    startFetch: function (secs) {
        countdown.start(secs, function () {live.fetchDataAndRestartCountdown()});
    },

    /**
     *
     */
    fetchDataAndRestartCountdown: function () {
        /**
         *
         * @type {{id: number, since: Date}[]}
         */
        let stationsToLoad = [];
        let time = new Date();
        selectedStations.forEach((station) => {
            stationsToLoad.push({
                id: station.id,
                since: station.liveData.timestampOfLastFetch
            });
            station.liveData.timestampOfLastFetch = time;
        });

        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));
        console.log("db request: ");
        console.log(stationsToLoad);

        /**
         *
         * @param xhr {XMLHttpRequest}
         */
        let update_fn = function (xhr) {
            let dataPerStation = JSON.parse(xhr.responseText);
            console.log("db response: ");
            console.log(dataPerStation);
            for (let dataset of dataPerStation) {
                stations[parseInt(dataset.id)].updateValues(dataset.data);
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            }
            // selectedStation.updateValues(JSON.parse(this.responseText));
            selectedStations.updateAndDisplay();
            live.sensorCharts.updateCharts();

            selectedStations.forEach(station => {
                selectedStations.updateOffline(station.id);
            });

            live.startFetch(10);
        }

        let xhr = fetch(data, "POST", "PHP/getDataLive.php", update_fn, true);
    }
}

const selectedStationsCookie = {
    /**
     *
     */
    _ids: null,

    /**
     *
     * @return {null}
     */
    getIds: function () {
        if (this._ids === null) {
            this._ids = [];

            let cookie = document.cookie.split('; ')
                .find(cookie => cookie.startsWith("station_ids="));
            if (cookie !== undefined) {
                cookie.split("=")[1].split(",").forEach(id => {
                    this._ids.push(parseInt(id));
                });
            }
        }
        return this._ids;
    },

    /**
     *
     * @param ids {number[]}
     */
    update: function (ids) {
        ids.sort();
        this._ids = ids;
        if (this._ids.length === 0) {
            document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "station_ids=" + this._ids + "; SameSite=Strict; Secure";
        }
    },
}

const selectedStations = {
    _idsDisplayed: [],
    _idsSelected: [],

    get: function () {
        let lstations = [];
        this._idsSelected.forEach(id => {
            lstations.push(stations[id])
        });
        return lstations;
    },

    /**
     *
     * @param id {number}
     */
    toggle: function (id) {
        // checks on wrong loaded charts
        if (this._idsSelected.length === 0 && loadedCharts !== "live") {
            selectedStationsCookie.update([id]);
            determineView();
            return;
        }

        if (this._idsSelected.includes(id)) {
            //remove
            // console.log("remove " + id);
            this.remove(id);
        } else {
            // add
            // console.log("adds " + id);
            this.push(id);
        }

        updateCharts();
    },

    /**
     *
     */
    clear: function () {
        // clears list
        this._idsSelected = [];

        // writes cookie
        this.updateCookie();

        // disables all styling
        this.display();

        determineView();
    },

    /**
     *
     * @param id {number}
     */
    remove: function (id) {
        // checks for already displayed
        if (!this._idsSelected.includes(id)) {
            return;
        }

        // takes out of list
        this._idsSelected.splice(this._idsSelected.indexOf(id), 1);

        // disables styling and removes from displayed stations
        this.display(id);

        //updates cookie
        this.updateCookie();
    },

    /**
     *
     * @param id {number}
     */
    push: function (id) {
        // checks for already displayed
        if (this._idsSelected.includes(id)) {
            return;
        }

        // adds to list
        this._idsSelected.push(id);

        // enables styling and adds to displayed stations
        this.display(id);

        // updates cookies
        this.updateCookie();
    },

    /**
     *
     * @param id
     */
    display: function (id=null) {
        console.log("id = " + id)
        let displayFunction = station => {
            let toDisplay = this._idsSelected.includes(station.id);
            // console.log("display - id: " + station.id + ", toDisplay: " + toDisplay);

            // toggles styling
            station.getNavNode().classList.toggle("selected", toDisplay);
            selectedStations.updateOffline(station.id, toDisplay);
        };

        if (typeof id === "number") {
            displayFunction(stations[id]);
        } else {
            stations.forEach(displayFunction);
        }
    },

    /**
     *
     * @param fn {function(Station)}
     */
    forEach: function (fn) {
        this._idsSelected.forEach(id => {
            fn(stations[id]);
        });
    },

    /**
     *
     * @param id {number}
     * @return {boolean}
     */
    includes: function (id) {
        return this._idsSelected.includes(id);
    },

    /**
     *
     * @param id {number}
     * @param forceOnline {boolean}
     */
    updateOffline: function (id, forceOnline=true) {
        stations[id].getNavNode().classList.toggle("offline", forceOnline && stations[id].isOffline());
    },

    updateCookie: function () {
        selectedStationsCookie.update(this._idsSelected);
    },

    updateAndDisplay: function () {
        //removes unselected
        for (let i = 0; i < this._idsDisplayed.length; i++){
            const id = this._idsDisplayed[i];
            if (!this._idsSelected.includes(id) && !stations[id].isOffline()) {
                this._idsDisplayed.splice(i, 1);
                live.sensorCharts.remove(id);
                i--;
            }
        }

        // adds selected
        for (let i = 0; i < this._idsSelected.length; i++){
            const station = stations[this._idsSelected[i]];
            if (!this._idsDisplayed.includes(station.id) && !station.isOffline()) {
                this._idsDisplayed.push(station.id);
                live.sensorCharts.push(station.id, {
                    humidity: {dataset: station.liveData.datasets.minHumidity, name: station.name + " min"},
                    temperature: {dataset: station.liveData.datasets.maxTemperature, name: station.name + " max"},
                    co2: {dataset: station.liveData.datasets.maxCo2, name: station.name + " max"},
                },{
                    humidity: {dataset: station.liveData.datasets.maxHumidity, name: station.name + " max"},
                    temperature: {dataset: station.liveData.datasets.minTemperature, name: station.name + " min"},
                    co2: {dataset: station.liveData.datasets.minCo2, name: station.name + " min"},
                });
            }
        }
    }
}