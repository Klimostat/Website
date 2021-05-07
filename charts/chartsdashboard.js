let dashboardCharts = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,

    /**
     * The maximum number of values per chart.
     * @type {number}
     */
    MAX_ENTRIES: 60,

    /**
     * Controls the data-updates
     * @type {Date}
     */
    lastUpdate: new Date,

    /**
     * Controls the data-updates
     * @type {number}
     */
    nextUpdateIn: 0,
    intervalObj: null
}

/**
 * initializes live charts and sets interval
 */
dashboardCharts.init = function () {
    document.getElementById("timing").innerHTML = "" +
        "                           Stand: <span id = \"lastUpdated\">noch nicht gelanden</span>, nächstes Update in <span id = \"nextUpdateIn\">0</span> Sekunden.\n" +
        "                           <a class=\"nav-link\" href=\"javascript:nextUpdateIn = 0; updateCountdown()\">Update</a>"

    let selectedStationId = getSelectedStation();
    for (let station of stations) {
        if (typeof station !== "object") {
            continue;
        }
        console.log("station-" + station.pk_station_id);
        document.getElementById("station-" + station.pk_station_id).classList.toggle("active", station.pk_station_id === selectedStationId);
    }

    charts = {
        // temperature: new Chart(document.getElementById('chart-temperature'), {
        // type: 'line',
        // data: {
        //     labels: [],
        //     datasets: [{
        //         label: 'Temperature in °C',
        //         data: [],
        //         backgroundColor: 'rgba(255, 99, 132, 0.7)',
        //         borderColor: 'rgba(255, 99, 132, 0.7)',
        //         borderWidth: 1
        //     }]
        // },
        // options: {
        //     legend: {
        //         labels: {
        //             fontColor: 'black',
        //             defaultFontColor: 'black'
        //         }
        //     },
        // },
        // }),
        humidity: new Chart(document.getElementById('chart-humidity'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: "Humidity in %",
                    data: [],
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
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
            data: {
                labels: [],
                datasets: [{
                    label: "CO2 concentration in ppm",
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
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

    dashboardCharts.lastUpdate = null;
    dashboardCharts.nextUpdateIn = 0;

    Notification.requestPermission();

    // intervalSelect.addEventListener("change", updateSummaryChartsTrigger);
    clearInterval(dashboardCharts.intervalObj);
    dashboardCharts.intervalObj = setInterval(dashboardCharts.updateCountdown, 1000);
}

/**
 * updates the countdown, is called by an interval every second
 */
dashboardCharts.updateCountdown = function () {
    if (dashboardCharts.nextUpdateIn <= 1) {
        dashboardCharts.updateCharts();
        dashboardCharts.nextUpdateIn = dashboardCharts.UPDATE_INTERVAL;
    } else {
        dashboardCharts.nextUpdateIn--;
    }
    document.getElementById("nextUpdateIn").innerHTML = "" + dashboardCharts.nextUpdateIn;
}

/**
 * updates the charts, the "last updated" message and variables
 */
dashboardCharts.updateCharts = function (since = dashboardCharts.lastUpdate, clearExistingData = false) {
    if (clearExistingData || loadedCharts !== "dashboard") {
        dashboardCharts.init();
        loadedCharts = "dashboard";
    }
    dashboardCharts.updateChartsWithValuesFromDB(getSelectedStation(), since);
    dashboardCharts.lastUpdate = new Date();
    document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(dashboardCharts.lastUpdate);
}

/**
 * updates a chart by requesting data from the server
 * @param station_ids {number[]} the station_id in the database
 * @param from {Date|null} the date from when the data should be loaded, not requested on null but 10 mins by default
 */
dashboardCharts.updateChartsWithValuesFromDB = function (station_ids, from) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            dashboardCharts.appendValuesToCharts(JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getMostRecentData.php", true);
    let data = new FormData();
    data.append('station_ids', station_ids);
    if (from !== null) {
        data.append('from', jsToUTCMySQLDate(from));
    }
    xhttp.send(data);
}

/**
 * appends values to a chart
 // * @param index {number} the index of the station in the stations array
 * @param dataset {Object[]} an array that has entries of {time:,co2:,temperature:,humidity:} objects
 */
dashboardCharts.appendValuesToCharts = function (dataset) {
    let alert = false;

    dataset.sort(function (a, b) {return a.co2 - b.co2})
    for (const entry of dataset) {
        if (entry.co2 >= grenzwertCO2) {
            alert = true;
        }
        charts.co2.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts.co2.data.datasets[0].data.push(entry.co2);
        if (charts.co2.data.datasets[0].data.length > dashboardCharts.MAX_ENTRIES) {
            charts.co2.data.labels.shift();
            charts.co2.data.datasets[0].data.shift();
        }
    }
    dataset.sort(function (a, b) {return a.humidity - b.humidity})
    for (const entry of dataset) {
        if (entry.humidity < grenzwertHumidity) {
            alert = true;
        }
        charts.humidity.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts.humidity.data.datasets[0].data.push(entry.humidity);
        if (charts.humidity.data.datasets[0].data.length > dashboardCharts.MAX_ENTRIES) {
            charts.humidity.data.labels.shift();
            charts.humidity.data.datasets[0].data.shift();
        }
    }
    charts.co2.update();
    charts.humidity.update();
    if (alert) {
        sendAlert("Klimostat: Grenzwertüberschreitung! Achtung ein Grenzwert wurde überschritten!")
    }
}

/**
 * updates the time interval that should be displayed.
 */
dashboardCharts.updateSummaryChartsTrigger = function () {
    let index = intervalSelect.selectedIndex;
    switch (index) {
        case "0":
            location.assign(".");
            break;
        default:
            location.assign(".?hist=" + index);
    }
}