/**
 * Object for the interval view, initiated with {@link init}
 * @type {Object}
 */
const interval = {
    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,

    /**
     * The SensorChart for the displayed stations
     * @type {SensorChart}
     */
    sensorCharts: null,

    /**
     * contains all intervals
     * @type {Object}
     */
    intervals: {},

    /**
     * the name of the loaded interval
     */
    loadedInterval: "",

    /**
     * initializes interval charts, displays selected stations out of the cookie and starts first fetch
     */
    init: function () {
        klimostat.charts = {
            temperature: new Chart(klimostat.chartNodes.temperature, {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        title: {
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
        klimostat.chartNodes.temperature.parentElement.style.display = "block";
        klimostat.chartNodes.humidity.parentElement.style.display = "block";
        klimostat.chartNodes.co2.parentElement.style.display = "block";

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
     * destroys all initialized variables
     */
    destroy: function () {
        klimostat.charts.temperature.destroy();
        klimostat.charts.humidity.destroy();
        klimostat.charts.co2.destroy();
        this.sensorCharts.clear();
        for (let chartNodesKey in klimostat.chartNodes) {
            klimostat.chartNodes[chartNodesKey].parentElement.style.display = "none";
        }
        selectedStations.updateAndDisplay(this.sensorCharts, "");
    },

    /**
     * starts a new fetch after given amount of seconds
     * @param secs {number}
     */
    startFetch: function (secs) {
        countdown.start(secs, function () {interval.fetchDataAndRestartCountdown()});
    },

    /**
     * prepares the data to fetch, fetches and starts a new fetch after the UPDATE_INTERVAL
     */
    fetchDataAndRestartCountdown: function () {

        let {data: data, method: method, url: url, callback: callback, refresh: refresh=false} = intervals.getSelected().fetch();

        /**
         *
         * @param xhr {XMLHttpRequest}
         */
        let update_fn = function (xhr) {

            callback(JSON.parse(xhr.responseText), interval.sensorCharts);

            selectedStations.updateAndDisplay(interval.sensorCharts, intervals.getSelected());
            interval.sensorCharts.updateCharts();

            if (refresh) {
                interval.startFetch(interval.UPDATE_INTERVAL);
            } else {
                countdown.stop();
            }
        }

        fetcher.fetch(data, method, url, update_fn, true);
    }
}