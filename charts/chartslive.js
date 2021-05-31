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
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    },
                },
            }),
            humidity: new Chart(document.getElementById('chart-humidity'), {
                type: 'line',
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    },
                }
            }),
            co2: new Chart(document.getElementById('chart-co2'), {
                type: 'line',
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
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
        selectedStations.display();
        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        // console.log("dashboard.destroy");
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
        this.sensorCharts.forEach((station) => {
            stationsToLoad.push({
                id: station.id,
                since: station.lastFetch
            })
        });

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
            // selectedStation.updateValues(JSON.parse(this.responseText));
            live.sensorCharts.updateCharts();

            selectedStations.forEach(station => {
                selectedStations.updateOffline(station.id);
            });

            live.startFetch(10);
        }

        let xhr = fetch(data, "POST", "PHP/getDataLive.php", update_fn, true);
    }
}

const selectedStations = {
    _ids: null,

    get: function () {
        let lstations = [];
        this.getIds().forEach(id => {
            lstations.push(stations[id])
        });
        return lstations;
    },

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
     * @param id {number}
     */
    toggle: function (id) {
        this.getIds();

        // checks on wrong loaded charts
        if (this._ids.length === 0 && loadedCharts !== "live") {
            this._ids.push(id);
            this.updateCookie();
            determineView();
            return;
        }

        if (this._ids.includes(id)) {
            //remove
            // console.log("remove " + id);
            this.remove(id, true)
        } else {
            // add
            // console.log("adds " + id);
            this.push(id, true);
        }

        this.updateCookie();

        updateCharts();
    },

    /**
     *
     */
    updateCookie: function () {
        if (this._ids.length === 0) {
            document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "station_ids=" + this._ids + "; SameSite=Strict; Secure";
        }
    },

    /**
     *
     */
    clear: function () {
        // loads updates from cookie
        this.getIds();

        // clears list
        this._ids = [];

        // writes cookie
        this.updateCookie();

        // disables all styling
        this.display();

        determineView();
    },

    /**
     *
     * @param id {number}
     * @param secure {boolean}
     */
    remove: function (id, secure = true) {
        if (secure) {
            // loads updates from cookie
            this.getIds();
        }

        // checks for already displayed
        if (!this._ids.includes(id)) {
            return;
        }

        // takes out of list
        this._ids.splice(this._ids.indexOf(id), 1);

        // disables styling and removes from displayed stations
        this.display(id);

        if (secure) {
            // writes cookie
            this.updateCookie();
        }
    },

    /**
     *
     * @param id {number}
     * @param secure {boolean}
     */
    push: function (id, secure=true) {
        if (secure) {
            // loads updates from cookie
            this.getIds();
        }

        // checks for already displayed
        if (this._ids.includes(id)) {
            return;
        }

        // checks on wrong loaded charts
        // if (loadedCharts !== "live") {
        //     this._ids.push(id);
        //     this.updateCookie();
        //     determineView();
        //     return;
        // }

        // adds to list
        this._ids.push(id);

        // enables styling and adds to displayed stations
        this.display(id);

        if (secure) {
            // updates cookies
            this.updateCookie();
        }
    },

    /**
     *
     * @param id
     */
    display: function (id=null) {
        // loads updates from cookie
        this.getIds();

        let displayFunction = station => {
            let toDisplay = this._ids.includes(station.id);
            // console.log("display - id: " + station.id + ", toDisplay: " + toDisplay);

            // toggles styling
            station.getNavNode().parentElement.classList.toggle("active", toDisplay);
            selectedStations.updateOffline(station.id, toDisplay);

            if (toDisplay) {
                // adds to graph
                // console.log("pushed toDisplay");
                live.sensorCharts.push(station.id, {
                    humidity: station.datasetChart.minHumidity,
                    temperature: station.datasetChart.maxTemperature,
                    co2: station.datasetChart.maxCo2,
                });
            } else {
                //removes from graph
                live.sensorCharts.remove(station.id);
            }

        };

        if (typeof id === "number") {
            displayFunction(stations[id]);
        } else {
            stations.forEach(displayFunction);
        }
    },

    /**
     *
     * @param fn
     */
    forEach: function (fn) {
        // loads updates from cookie
        this.getIds();

        this._ids.forEach(id => {
            fn(stations[id]);
        });
    },

    /**
     *
     * @param id {number}
     * @return {boolean}
     */
    includes: function (id) {
        // loads updates from cookie
        this.getIds();

        return this._ids.includes(id);
    },

    /**
     *
     * @param id {number}
     * @param forceOnline {boolean}
     */
    updateOffline: function (id, forceOnline=true) {
        stations[id].getNavNode().parentElement.classList.toggle("off", forceOnline && stations[id].isOffline());
    }
}