const interval = {

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
     * @type {Object}
     */
    intervals: {},

    loadedInterval: "",

    /**
     * initializes live charts and sets interval
     */
    init: function () {
        // console.log("init called")
        // const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

        klimostat.charts = {
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
            {name: "temperature", chart: klimostat.charts.temperature},
            {name: "humidity", chart: klimostat.charts.humidity},
            {name: "co2", chart:klimostat.charts.co2}
        ]);

        selectedStationsCookie.getIds().forEach(id => {
            selectedStations.push(id);
        });

        intervals.setSelected(selectedIntervalCookie.getInterval(), false);

        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        klimostat.charts.temperature.destroy();
        klimostat.charts.humidity.destroy();
        klimostat.charts.co2.destroy();
        this.sensorCharts.clear();
        selectedStations.updateAndDisplay(this.sensorCharts, "");
    },

    startFetch: function (secs) {
        countdown.start(secs, function () {interval.fetchDataAndRestartCountdown()});
    },

    /**
     *
     */
    fetchDataAndRestartCountdown: function () {

        let {data: data, method: method, url: url, callback: callback, refresh: refresh=false} = klimostat.intervals[intervals.getSelected()].fetch();

        /**
         *
         * @param xhr {XMLHttpRequest}
         */
        let update_fn = function (xhr) {

            console.log("db response:");
            console.log(JSON.parse(xhr.responseText));
            callback(JSON.parse(xhr.responseText));

            console.log("selectedStations: ")
            console.log(selectedStations.get());
            selectedStations.updateAndDisplay(interval.sensorCharts, intervals.getSelected());
            interval.sensorCharts.updateCharts();

            if (refresh) {
                interval.startFetch(10);
            } else {
                countdown.stop();
            }
        }

        fetcher.fetch(data, method, url, update_fn, true);
    }
}

const intervals = {
    /**
     * @type {?HTMLElement}
     */
    _node: null,

    /**
     *
     * @param name {String}
     */
    push: function (name) {
        let node = this.getNode();
        let option = document.createElement("option");
        option.innerHTML = name;
        option.value = name;
        node.appendChild(option);
    },

    /**
     *
     * @return {HTMLElement}
     */
    getNode: function () {
        if (this._node === null || this._node.constructor !== HTMLElement) {
            this._node = document.getElementById("interval");
        }
        return this._node;
    },

    /**
     *
     * @return {String}
     */
    getSelected: function () {
        return this.getNode().value;
    },

    /**
     *
     */
    setSelected: function (interval = null, updateCharts = true) {
        if (interval !== null) {
            this._node.value = interval;
        }
        selectedIntervalCookie.update(this._node.value);
        if (updateCharts) {
            klimostat.updateCharts();
        }
    }
}

const selectedIntervalCookie = {
    /**
     *
     */
    _interval: null,

    /**
     *
     * @return {null}
     */
    getInterval: function () {
        if (this._interval === null) {
            let cookie = document.cookie.split('; ')
                .find(cookie => cookie.startsWith("interval="));
            if (cookie !== undefined) {
                this._interval = cookie.split("=")[1];
            }
        }
        return this._interval;
    },

    /**
     *
     * @param interval {String}
     */
    update: function (interval) {
        this._interval = interval;
        if (this._interval === null) {
            document.cookie = "interval=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "interval=" + this._interval + "; SameSite=Strict; Secure";
        }
    },
}
